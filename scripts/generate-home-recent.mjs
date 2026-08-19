import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "src/content/home-recent.generated.ts");
const blogsRoot = path.join(root, "src/pages/blogs");
const aiBaseUrl = process.env.HOMEPAGE_AI_BASE_URL?.replace(/\/+$/, "");
const aiApiKey = process.env.HOMEPAGE_AI_API_KEY;
const aiModel = process.env.HOMEPAGE_AI_MODEL;
const githubToken = process.env.HOMEPAGE_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const githubRepos = (process.env.HOMEPAGE_GITHUB_REPOS || "dangjingtao/tomz-io,dangjingtao/uichat-mira")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const fallback = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: "fallback",
  items: [
    {
      kind: "在做",
      title: "tomz.io",
      summary: "最近仍在整理这个个人网站，以及它应该长期留下什么。",
      href: "/blogs",
    },
    {
      kind: "在做",
      title: "UIChat Mira",
      summary: "这个长期项目仍在继续推进，最近的变化可以从项目与公开记录里继续追踪。",
      href: "https://docs.uichat.tomz.io/",
    },
    {
      kind: "在写",
      title: "最近的写作",
      summary: "继续记录产品、阅读、工作与生活里值得留下来的部分。",
      href: "/blogs",
    },
  ],
};

async function walkMarkdown(dir) {
  const files = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "mi"));
  return match?.[1]?.trim() || "";
}

async function collectWritingFacts() {
  const files = await walkMarkdown(blogsRoot);
  const facts = [];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const title = frontmatterValue(source, "title") || path.basename(file, ".md");
    const date = frontmatterValue(source, "date");
    const description = frontmatterValue(source, "description");
    const relative = path.relative(blogsRoot, file).replaceAll(path.sep, "/");
    const category = relative.split("/")[0] || "";
    facts.push({ title, date, description, category, relative });
  }
  return facts
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 12);
}

async function collectGithubFacts() {
  const facts = [];
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tomz-io-home-recent",
  };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

  for (const repo of githubRepos) {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=8`, { headers });
      if (!response.ok) continue;
      const commits = await response.json();
      facts.push({
        repo,
        commits: commits.slice(0, 8).map((commit) => ({
          sha: commit.sha?.slice(0, 8),
          date: commit.commit?.author?.date,
          message: String(commit.commit?.message || "").split("\n")[0],
        })),
      });
    } catch {
      // GitHub activity is optional. Local published writing remains a valid source.
    }
  }
  return facts;
}

function serializeSnapshot(snapshot) {
  const items = JSON.stringify(snapshot.items, null, 2);
  return `export type HomeRecentItem = {\n  kind: "在做" | "在想" | "在读" | "在写" | "生活" | "工作";\n  title: string;\n  summary: string;\n  href?: string;\n};\n\nexport const homeRecentSnapshot = {\n  generatedAt: ${JSON.stringify(snapshot.generatedAt)},\n  generatedBy: ${JSON.stringify(snapshot.generatedBy)} as const,\n  items: ${items} satisfies HomeRecentItem[],\n};\n`;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced || text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response did not contain JSON");
  return JSON.parse(candidate.slice(start, end + 1));
}

function validateItems(value) {
  const allowedKinds = new Set(["在做", "在想", "在读", "在写", "生活", "工作"]);
  if (!Array.isArray(value?.items) || value.items.length !== 3) {
    throw new Error("AI response must contain exactly three items");
  }
  return value.items.map((item) => {
    if (!allowedKinds.has(item.kind)) throw new Error(`Unsupported kind: ${item.kind}`);
    if (!item.title || !item.summary) throw new Error("Each item needs title and summary");
    return {
      kind: item.kind,
      title: String(item.title).slice(0, 48),
      summary: String(item.summary).slice(0, 180),
      ...(item.href ? { href: String(item.href) } : {}),
    };
  });
}

async function generateWithAi(facts) {
  if (!aiBaseUrl || !aiApiKey || !aiModel) return null;
  const prompt = `你在为 Tomz Dang 的个人网站 tomz.io 编辑首页“最近”模块。\n\n只使用给定事实，选出最能代表最近状态的 3 件事。允许项目、公开工作、写作、阅读和生活混合；同一个项目不要垄断三个位置。公司/组织相关内容默认尽量脱敏，把重点放在 Tomz 正在解决什么问题。不要把 Tomz 写成专家、思想领袖或夸张人物。\n\n输出纯 JSON：{"items":[{"kind":"在做|在想|在读|在写|生活|工作","title":"短标题","summary":"一两句自然中文","href":"可选"}]}。不要补充事实，不要输出 Markdown。\n\n事实：\n${JSON.stringify(facts, null, 2)}`;

  const response = await fetch(`${aiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: aiModel,
      temperature: 0.3,
      messages: [
        { role: "system", content: "你是谨慎的个人网站编辑，只能总结输入事实。" },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI endpoint returned ${response.status}`);
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI response was empty");
  const parsed = extractJson(text);
  return validateItems(parsed);
}

async function main() {
  const [writing, github] = await Promise.all([
    collectWritingFacts(),
    collectGithubFacts(),
  ]);
  const facts = {
    generatedAt: new Date().toISOString(),
    publicWriting: writing,
    githubActivity: github,
    constraints: {
      developerLifeIsPublicLifeSource: true,
      privateChatsCalendarsEmailsAreExcluded: true,
    },
  };

  try {
    const aiItems = await generateWithAi(facts);
    if (aiItems) {
      const snapshot = {
        generatedAt: new Date().toISOString().slice(0, 10),
        generatedBy: "ai",
        items: aiItems,
      };
      await fs.writeFile(outputPath, serializeSnapshot(snapshot), "utf8");
      console.log(`Homepage recent snapshot generated by AI: ${snapshot.generatedAt}`);
      return;
    }
  } catch (error) {
    console.warn(`Homepage AI summary failed: ${error instanceof Error ? error.message : error}`);
  }

  try {
    await fs.access(outputPath);
    console.log("Homepage AI credentials unavailable; keeping committed recent snapshot as fallback.");
  } catch {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, serializeSnapshot(fallback), "utf8");
    console.log("Homepage recent snapshot missing; wrote deterministic fallback.");
  }
}

await main();
