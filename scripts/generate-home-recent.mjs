import { promises as fs } from "node:fs";
import path from "node:path";

import {
  homepageAiRoute,
  missingHomepageAiConfiguration,
  runHomepageJsonPrompt,
} from "./homepage-ai-opencode.mjs";

const root = process.cwd();
const outputPath = path.join(root, "src/content/home-recent.generated.ts");
const blogsRoot = path.join(root, "src/pages/blogs");
const projectsRoot = path.join(root, "src/pages/projects");
const aiMaxAttempts = 2;
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

function validateItems(value) {
  const allowedKinds = new Set(["在做", "在想", "在读", "在写", "生活", "工作"]);
  if (!Array.isArray(value?.items) || value.items.length !== 3) {
    throw new Error("AI response must contain exactly three items");
  }
  return value.items.map((item, index) => {
    if (!allowedKinds.has(item.kind)) throw new Error(`Unsupported kind: ${item.kind}`);
    if (!item.title || !item.summary) throw new Error("Each item needs title and summary");
    if (!item.sourceId) throw new Error("Each item needs sourceId");
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

function deterministicRecentItems(writing, projects, github) {
  const candidates = [
    ...writing.slice(0, 6).map((fact) => ({
      lane: "writing",
      date: fact.date || "",
      kind: "在写",
      title: fact.title,
      summary: fact.description || `最近发布了《${fact.title}》。`,
      sourceId: fact.sourceId,
    })),
    ...projects.slice(0, 6).map((fact) => ({
      lane: "project",
      date: fact.date || "",
      kind: "在做",
      title: fact.title,
      summary: fact.description || `最近仍在推进 ${fact.title}。`,
      sourceId: fact.sourceId,
    })),
    ...github
      .map((fact) => {
        const latest = fact.commits?.[0];
        if (!latest) return null;
        return {
          lane: "github",
          date: latest.date || "",
          kind: "在做",
          title: fact.repo?.split("/").pop() || fact.repo || "公开项目",
          summary: latest.message
            ? `最近一次公开提交：${latest.message}`
            : "最近有新的公开提交。",
          sourceId: fact.sourceId,
        };
      })
      .filter(Boolean),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const selected = [];
  const laneCounts = new Map();
  const usedSources = new Set();

  function addCandidate(candidate) {
    selected.push({
      kind: candidate.kind,
      title: String(candidate.title).slice(0, 48),
      summary: String(candidate.summary).slice(0, 180),
      sourceId: candidate.sourceId,
    });
    usedSources.add(candidate.sourceId);
    laneCounts.set(candidate.lane, (laneCounts.get(candidate.lane) || 0) + 1);
  }

  // First pass prefers source diversity.
  for (const candidate of candidates) {
    if (usedSources.has(candidate.sourceId)) continue;
    const laneCount = laneCounts.get(candidate.lane) || 0;
    if (candidate.lane === "writing" && laneCount >= 2) continue;

    addCandidate(candidate);
    if (selected.length === 3) return selected;
  }

  // If public facts only exist in one lane, freshness is more important than
  // preserving diversity: fill the remaining slots instead of falling back to
  // a stale committed snapshot.
  for (const candidate of candidates) {
    if (usedSources.has(candidate.sourceId)) continue;
    addCandidate(candidate);
    if (selected.length === 3) break;
  }

  return selected;
}

const recentItemsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          kind: {
            type: "string",
            enum: ["在做", "在想", "在读", "在写", "生活", "工作"],
          },
          title: { type: "string", minLength: 1 },
          summary: { type: "string", minLength: 1 },
          sourceId: { type: "string", minLength: 1 },
        },
        required: ["kind", "title", "summary", "sourceId"],
      },
    },
  },
  required: ["items"],
};

async function generateWithAi(facts) {
  if (missingHomepageAiConfiguration().length > 0) return null;

  const route = homepageAiRoute();
  const prompt = `你是谨慎的个人网站编辑，只能总结输入事实。

你在为 Tomz Dang 的个人网站 tomz.io 编辑首页“最近”模块。

只使用给定事实，选出最能代表最近状态的 3 件事。允许项目、项目记录、公开工作、写作、阅读和生活混合；同一个项目不要垄断三个位置。公司/组织相关内容默认尽量脱敏，把重点放在 Tomz 正在解决什么问题。不要把 Tomz 写成专家、思想领袖或夸张人物。

每一项必须引用事实中已有的 sourceId。不要生成、猜测或返回任何 href / URL，链接由程序根据 sourceId 映射。

返回符合给定结构化输出 schema 的对象，不要补充输入事实之外的信息。

事实：
${JSON.stringify(facts, null, 2)}`;

  console.log(
    `[home-recent] request route=${route.provider}/${route.model} factsBytes=${Buffer.byteLength(JSON.stringify(facts), "utf8")}`,
  );

  const structured = await runHomepageJsonPrompt({
    title: "Tomz.io Homepage Recent",
    prompt,
    schema: recentItemsSchema,
});
  if (!structured) return null;
  return validateItems(structured);
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
  const missing = missingHomepageAiConfiguration();
  let failureReason = "";

  if (missing.length === 0) {
    for (let attempt = 1; attempt <= aiMaxAttempts; attempt += 1) {
      try {
        const aiItems = await generateWithAi(facts);
        if (aiItems) {
          const snapshot = {
            generatedAt: new Date().toISOString().slice(0, 10),
            generatedBy: "ai",
            items: resolveItems(aiItems, policy),
          };
          await fs.writeFile(outputPath, serializeSnapshot(snapshot), "utf8");
          console.log(
            `Homepage recent snapshot generated by AI: ${snapshot.generatedAt} attempt=${attempt}/${aiMaxAttempts}`,
          );
          return;
        }
      } catch (error) {
        failureReason = error instanceof Error ? error.message : String(error);
        console.warn(
          `[home-recent] AI attempt ${attempt}/${aiMaxAttempts} failed: ${failureReason}`,
        );
      }
    }

    const deterministicItems = deterministicRecentItems(writing, projects, github);
    if (deterministicItems.length === 3) {
      const snapshot = {
        generatedAt: new Date().toISOString().slice(0, 10),
        generatedBy: "fallback",
        items: resolveItems(deterministicItems, policy),
      };
      await fs.writeFile(outputPath, serializeSnapshot(snapshot), "utf8");
      console.warn(
        `[home-recent] AI exhausted ${aiMaxAttempts} attempts; wrote current deterministic fallback instead of stale committed snapshot; reason=${failureReason || "AI returned no usable result"}`,
      );
      return;
    }
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
