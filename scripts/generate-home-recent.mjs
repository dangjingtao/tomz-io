import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "src/content/home-recent.generated.ts");
const blogsRoot = path.join(root, "src/pages/blogs");
const projectsRoot = path.join(root, "src/pages/projects");
const aiBaseUrl = process.env.HOMEPAGE_AI_BASE_URL?.replace(/\/+$/, "");
const aiApiKey = process.env.HOMEPAGE_AI_API_KEY;
const aiModel = process.env.HOMEPAGE_AI_MODEL;
const githubToken = process.env.HOMEPAGE_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const githubRepos = (process.env.HOMEPAGE_GITHUB_REPOS || "dangjingtao/tomz-io,dangjingtao/uichat-mira")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const staticSources = [
  { sourceId: "section:blogs", href: "/blogs" },
  { sourceId: "section:projects", href: "/projects" },
  { sourceId: "project:uichat-mira-docs", href: "https://docs.uichat.tomz.io/" },
];
const configuredGithubSources = githubRepos.map((repo) => ({
  sourceId: `github:${repo}`,
  href: `https://github.com/${repo}`,
}));

const fallback = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: "fallback",
  items: [
    {
      kind: "在做",
      title: "tomz.io",
      summary: "最近仍在整理这个个人网站，以及它应该长期留下什么。",
      sourceId: "section:blogs",
    },
    {
      kind: "在做",
      title: "UIChat Mira",
      summary: "这个长期项目仍在继续推进，最近的变化可以从项目与公开记录里继续追踪。",
      sourceId: "project:uichat-mira-docs",
    },
    {
      kind: "在写",
      title: "最近的写作",
      summary: "继续记录产品、阅读、工作与生活里值得留下来的部分。",
      sourceId: "section:blogs",
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

async function collectMarkdownFacts(contentRoot, routeRoot, sourcePrefix) {
  const files = await walkMarkdown(contentRoot);
  const facts = [];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const relative = path.relative(contentRoot, file).replaceAll(path.sep, "/");
    const title = frontmatterValue(source, "title") || path.basename(file, ".md");
    const date = frontmatterValue(source, "date");
    const description = frontmatterValue(source, "description");
    const merge = frontmatterValue(source, "merge");
    const mergeIndex = frontmatterValue(source, "mergeIndex") === "true";
    if (merge && !mergeIndex) continue;

    const route = relative.replace(/\/index\.md$/i, "").replace(/\.md$/i, "");
    const category = relative.split("/")[0] || "";
    facts.push({
      sourceId: `${sourcePrefix}:${route}`,
      href: `/${routeRoot}/${route}`,
      title,
      date,
      description,
      category,
      relative,
    });
  }
  return facts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
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
        sourceId: `github:${repo}`,
        href: `https://github.com/${repo}`,
        repo,
        commits: commits.slice(0, 8).map((commit) => ({
          sha: commit.sha?.slice(0, 8),
          date: commit.commit?.author?.date,
          message: String(commit.commit?.message || "").split("\n")[0],
        })),
      });
    } catch {
      // GitHub activity is optional. Local published content remains a valid source.
    }
  }
  return facts;
}

function createLinkPolicy(writing, projects, github) {
  const sources = [
    ...staticSources,
    ...configuredGithubSources,
    ...writing,
    ...projects,
    ...github,
  ];
  const registry = new Map(sources.map((source) => [source.sourceId, source.href]));
  const internalRoutes = new Set(
    sources
      .map((source) => source.href)
      .filter((href) => href.startsWith("/"))
      .map((href) => href.split(/[?#]/, 1)[0] || "/"),
  );
  const externalHrefs = new Set(
    sources
      .map((source) => source.href)
      .filter((href) => /^https?:\/\//i.test(href)),
  );
  return { registry, internalRoutes, externalHrefs };
}

function allowedHref(href, policy) {
  if (href.startsWith("/")) {
    const route = href.split(/[?#]/, 1)[0] || "/";
    return policy.internalRoutes.has(route);
  }
  if (/^https?:\/\//i.test(href)) return policy.externalHrefs.has(href);
  return false;
}

function resolveItems(items, policy) {
  return items.map((item, index) => {
    const { sourceId, ...content } = item;
    if (!sourceId) {
      console.warn(`[home-recent] item ${index + 1} has no sourceId; link removed`);
      return content;
    }

    const href = policy.registry.get(sourceId);
    if (!href) {
      console.warn(`[home-recent] unknown sourceId "${sourceId}"; link removed`);
      return content;
    }

    if (!allowedHref(href, policy)) {
      console.warn(`[home-recent] invalid link for sourceId "${sourceId}": ${href}; link removed`);
      return content;
    }

    return { ...content, href };
  });
}

async function sanitizeExistingSnapshot(policy) {
  let source;
  try {
    source = await fs.readFile(outputPath, "utf8");
  } catch {
    return 0;
  }

  let removed = 0;
  const next = source.replace(
    /^\s*"href":\s*("(?:[^"\\]|\\.)*")\s*,?\s*\n?/gm,
    (line, encodedHref) => {
      try {
        const href = JSON.parse(encodedHref);
        if (allowedHref(href, policy)) return line;
      } catch {
        // Invalid generated hrefs are removed below.
      }
      removed += 1;
      return "";
    },
  );

  if (removed > 0) {
    await fs.writeFile(outputPath, next, "utf8");
    console.warn(`[home-recent] removed ${removed} invalid committed link(s); build continues`);
  }
  return removed;
}

function serializeSnapshot(snapshot) {
  const items = JSON.stringify(snapshot.items, null, 2);
  return `export type HomeRecentItem = {\n  kind: "在做" | "在想" | "在读" | "在写" | "生活" | "工作";\n  title: string;\n  summary: string;\n  href?: string;\n};\n\nexport const homeRecentSnapshot = {\n  generatedAt: ${JSON.stringify(snapshot.generatedAt)},\n  generatedBy: ${JSON.stringify(snapshot.generatedBy)} as const,\n  items: ${items} satisfies HomeRecentItem[],\n};\n`;
}

function stripThinkBlocks(text) {
  return String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<mm:think>[\s\S]*?<\/mm:think>/gi, "")
    .trim();
}

function jsonObjectCandidates(text) {
  const cleaned = stripThinkBlocks(text);
  const fenced = [...cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);
  const sources = [...fenced, cleaned];
  const candidates = [];
  const seen = new Set();

  for (const source of sources) {
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        if (depth === 0) start = index;
        depth += 1;
        continue;
      }

      if (char === "}" && depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          const candidate = source.slice(start, index + 1);
          if (!seen.has(candidate)) {
            seen.add(candidate);
            candidates.push(candidate);
          }
          start = -1;
        }
      }
    }
  }

  return candidates;
}

function extractItemsJson(text) {
  const candidates = jsonObjectCandidates(text);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed?.items)) return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw new Error(`AI JSON parse failed: ${lastError instanceof Error ? lastError.message : lastError}`);
  }
  throw new Error("AI response did not contain a usable items JSON object");
}

function validateItems(value) {
  const allowedKinds = new Set(["在做", "在想", "在读", "在写", "生活", "工作"]);
  if (!Array.isArray(value?.items) || value.items.length !== 3) {
    throw new Error("AI response must contain exactly three items");
  }
  return value.items.map((item, index) => {
    if (!allowedKinds.has(item.kind)) throw new Error(`Unsupported kind: ${item.kind}`);
    if (!item.title || !item.summary) throw new Error("Each item needs title and summary");
    if (item.href) {
      console.warn(`[home-recent] item ${index + 1} returned href directly; ignored`);
    }
    return {
      kind: item.kind,
      title: String(item.title).slice(0, 48),
      summary: String(item.summary).slice(0, 180),
      ...(item.sourceId ? { sourceId: String(item.sourceId) } : {}),
    };
  });
}

function missingAiConfiguration() {
  const missing = [];
  if (!aiBaseUrl) missing.push("HOMEPAGE_AI_BASE_URL");
  if (!aiApiKey) missing.push("HOMEPAGE_AI_API_KEY");
  if (!aiModel) missing.push("HOMEPAGE_AI_MODEL");
  return missing;
}

async function generateWithAi(facts) {
  if (missingAiConfiguration().length > 0) return null;
  const prompt = `你在为 Tomz Dang 的个人网站 tomz.io 编辑首页“最近”模块。\n\n只使用给定事实，选出最能代表最近状态的 3 件事。允许项目、项目记录、公开工作、写作、阅读和生活混合；同一个项目不要垄断三个位置。公司/组织相关内容默认尽量脱敏，把重点放在 Tomz 正在解决什么问题。不要把 Tomz 写成专家、思想领袖或夸张人物。\n\n每一项必须引用事实中已有的 sourceId。不要生成、猜测或返回任何 href / URL，链接由程序根据 sourceId 映射。\n\n输出纯 JSON：{"items":[{"kind":"在做|在想|在读|在写|生活|工作","title":"短标题","summary":"一两句自然中文","sourceId":"事实中已有的 sourceId"}]}。不要补充事实，不要输出 Markdown。\n\n事实：\n${JSON.stringify(facts, null, 2)}`;

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
  return validateItems(extractItemsJson(text));
}

function factsForAi(writing, projects, github) {
  const publicWriting = writing.slice(0, 12).map(({ href: _href, ...fact }) => fact);
  const publicProjects = projects.slice(0, 12).map(({ href: _href, ...fact }) => fact);
  const githubActivity = github.map(({ href: _href, ...fact }) => fact);
  return {
    generatedAt: new Date().toISOString(),
    publicWriting,
    publicProjects,
    githubActivity,
    constraints: {
      developerLifeIsPublicLifeSource: true,
      projectPagesArePublicProjectSources: true,
      privateChatsCalendarsEmailsAreExcluded: true,
    },
  };
}

async function main() {
  const [writing, projects, github] = await Promise.all([
    collectMarkdownFacts(blogsRoot, "blogs", "writing"),
    collectMarkdownFacts(projectsRoot, "projects", "project-page"),
    collectGithubFacts(),
  ]);
  const policy = createLinkPolicy(writing, projects, github);
  const facts = factsForAi(writing, projects, github);
  const missing = missingAiConfiguration();
  let failureReason = "";

  try {
    const aiItems = await generateWithAi(facts);
    if (aiItems) {
      const snapshot = {
        generatedAt: new Date().toISOString().slice(0, 10),
        generatedBy: "ai",
        items: resolveItems(aiItems, policy),
      };
      await fs.writeFile(outputPath, serializeSnapshot(snapshot), "utf8");
      console.log(`Homepage recent snapshot generated by AI: ${snapshot.generatedAt}`);
      return;
    }
  } catch (error) {
    failureReason = error instanceof Error ? error.message : String(error);
    console.warn(`[home-recent] AI generation failed: ${failureReason}`);
  }

  try {
    await fs.access(outputPath);
    const removed = await sanitizeExistingSnapshot(policy);
    if (removed === 0) {
      const reason = missing.length > 0
        ? `missing configuration: ${missing.join(", ")}`
        : failureReason || "AI returned no usable result";
      console.log(`[home-recent] keeping committed recent snapshot; reason=${reason}`);
    }
  } catch {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const snapshot = {
      ...fallback,
      items: resolveItems(fallback.items, policy),
    };
    await fs.writeFile(outputPath, serializeSnapshot(snapshot), "utf8");
    console.log("Homepage recent snapshot missing; wrote deterministic fallback.");
  }
}

await main();
