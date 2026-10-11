import { promises as fs } from "node:fs";
import path from "node:path";

import {
  homepageAiRoute,
  missingHomepageAiConfiguration,
  runHomepageJsonPrompt,
} from "./homepage-ai-opencode.mjs";

const root = process.cwd();
const outputPath = path.join(root, "src/content/home-focus.generated.ts");
const contentRoots = [
  { root: "blogs", dir: path.join(root, "src/pages/blogs") },
  { root: "projects", dir: path.join(root, "src/pages/projects") },
  { root: "books", dir: path.join(root, "src/pages/books") },
];

const refreshIntervalDays = 7;
const aiMaxAttempts = 2;
const forceAiRefresh = ["1", "true", "yes"].includes(
  String(process.env.HOMEPAGE_AI_FORCE || "").toLowerCase(),
);

const fallbackQuestions = [
  "AI 如何真正进入人的日常生活。",
  "一个产品为什么会让人愿意留下。",
  "设计如何改变人与技术之间的关系。",
  "工作、创造和生活，怎样才能长期共存。",
];

async function walk(dir) {
  const files = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name === "_book.yml")) files.push(full);
  }
  return files;
}

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "mi"));
  return match?.[1]?.trim() || "";
}

function stripFrontmatter(source) {
  return source.replace(/^---\s*[\s\S]*?\s*---\s*/m, "");
}

function compactExcerpt(source) {
  return stripFrontmatter(source)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\[\]()|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

async function collectEvidence() {
  const evidence = [];
  for (const sourceRoot of contentRoots) {
    const files = await walk(sourceRoot.dir);
    for (const file of files) {
      const source = await fs.readFile(file, "utf8");
      const relative = path.relative(sourceRoot.dir, file).replaceAll(path.sep, "/");

      if (file.endsWith("_book.yml")) {
        evidence.push({
          source: `${sourceRoot.root}:${relative}`,
          type: "collection",
          title: frontmatterValue(source, "title"),
          description: frontmatterValue(source, "description"),
          category: frontmatterValue(source, "category"),
          status: frontmatterValue(source, "status"),
        });
        continue;
      }

      const title = frontmatterValue(source, "title") || path.basename(file, ".md");
      const description = frontmatterValue(source, "description");
      const group = frontmatterValue(source, "group");
      const tags = frontmatterValue(source, "tags");
      const date = frontmatterValue(source, "date");
      evidence.push({
        source: `${sourceRoot.root}:${relative}`,
        type: "document",
        title,
        description,
        group,
        tags,
        date,
        excerpt: compactExcerpt(source),
      });
    }
  }

  return evidence
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 80);
}

function validateQuestions(value) {
  if (!Array.isArray(value?.questions)) {
    throw new Error("AI response did not contain a questions array");
  }

  const questions = value.questions.map((item) => String(item).trim()).filter(Boolean);
  if (questions.length < 4 || questions.length > 6) {
    throw new Error(`AI question count out of range: ${questions.length}`);
  }

  const tooLongIndex = questions.findIndex((item) => item.length > 42);
  if (tooLongIndex >= 0) {
    throw new Error(`AI question ${tooLongIndex + 1} is too long: ${questions[tooLongIndex].length} chars`);
  }

  return questions;
}

async function readSnapshotMeta() {
  try {
    const source = await fs.readFile(outputPath, "utf8");
    return {
      generatedAt: source.match(/generatedAt:\s*["']([^"']+)["']/)?.[1] || "",
      generatedBy: source.match(/generatedBy:\s*["']([^"']+)["']/)?.[1] || "",
    };
  } catch {
    return null;
  }
}

function snapshotAgeDays(generatedAt) {
  if (!generatedAt) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(`${generatedAt}T00:00:00Z`);
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

const focusQuestionsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: { type: "string", minLength: 1 },
    },
  },
  required: ["questions"],
};

async function generateWithAi(evidence) {
  const missing = missingHomepageAiConfiguration();
  if (missing.length > 0) return null;

  const route = homepageAiRoute();
  const prompt = `你是谨慎的个人网站编辑，只能从公开材料中归纳长期主题，不能定义作者人格。

你在为 Tomz Dang 的个人网站 tomz.io 提炼“长期关注”的问题。

这不是人格生成，也不是替 Tomz 决定他应该关心什么。你只能从公开内容中观察长期、反复出现的主题，并把它们写成 4 到 6 个没有标准答案的问题。

要求：
1. 每个问题必须能从多个不同内容条目中找到支持；不要因为单篇偶发内容新增长期主题。
2. 主题类别完全开放，不预设技术、生活、创作或价值方向；只按证据归纳。
3. 不要把 Tomz 写成专家、思想领袖或某种固定人格。
4. 不写结论，只写开放问题。
5. 措辞克制、自然、具体，每条不超过 42 个汉字；尽量保持长期稳定，不追逐短期热点。
6. 不要机械复制标题，不要输出解释或证据列表。

返回符合给定结构化输出 schema 的对象。

公开内容证据：
${JSON.stringify(evidence, null, 2)}`;

  console.log(
    `[home-focus] request route=${route.provider}/${route.model} evidence=${evidence.length} promptChars=${prompt.length} promptBytes=${Buffer.byteLength(prompt, "utf8")}`,
  );

  const jsonData = await runHomepageJsonPrompt({
    title: "Tomz.io Homepage Focus",
    prompt,
    schema: focusQuestionsSchema,
  });
  if (!jsonData) return null;

  const questions = validateQuestions(jsonData);
  console.log(
    `[home-focus] validation ok count=${questions.length} lengths=${questions.map((item) => item.length).join(",")}`,
  );
  return questions;
}

function serializeSnapshot({ generatedAt, generatedBy, questions }) {
  return `export const homeFocusSnapshot = {\n  generatedAt: ${JSON.stringify(generatedAt)},\n  generatedBy: ${JSON.stringify(generatedBy)} as const,\n  questions: ${JSON.stringify(questions, null, 2)} as string[],\n};\n`;
}

async function main() {
  const snapshotMeta = await readSnapshotMeta();
  const ageDays = snapshotMeta ? snapshotAgeDays(snapshotMeta.generatedAt) : Number.POSITIVE_INFINITY;

  if (
    !forceAiRefresh
    && snapshotMeta?.generatedBy === "ai"
    && ageDays < refreshIntervalDays
  ) {
    console.log(
      `[home-focus] refresh skipped; last AI snapshot=${snapshotMeta.generatedAt} ageDays=${ageDays} minimumIntervalDays=${refreshIntervalDays}`,
    );
    return;
  }

  if (forceAiRefresh) {
    console.log("[home-focus] forced refresh requested; ignoring 7-day throttle.");
  } else if (snapshotMeta) {
    console.log(
      `[home-focus] refresh eligible; generatedBy=${snapshotMeta.generatedBy || "unknown"} generatedAt=${snapshotMeta.generatedAt || "unknown"} ageDays=${Number.isFinite(ageDays) ? ageDays : "unknown"}`,
    );
  }

  const evidence = await collectEvidence();
  const sourceCounts = evidence.reduce((counts, item) => {
    const rootName = String(item.source).split(":", 1)[0] || "unknown";
    counts[rootName] = (counts[rootName] || 0) + 1;
    return counts;
  }, {});
  const evidenceJson = JSON.stringify(evidence);

  console.log(
    `[home-focus] evidence collected total=${evidence.length} bySource=${JSON.stringify(sourceCounts)} chars=${evidenceJson.length} bytes=${Buffer.byteLength(evidenceJson, "utf8")}`,
  );

  const missing = missingHomepageAiConfiguration();
  if (missing.length > 0) {
    console.warn(`[home-focus] AI configuration missing: ${missing.join(", ")}`);
  }

  let failureReason = "";
  if (missing.length === 0) {
    for (let attempt = 1; attempt <= aiMaxAttempts; attempt += 1) {
      try {
        const questions = await generateWithAi(evidence);
        if (questions) {
          await fs.writeFile(
            outputPath,
            serializeSnapshot({
              generatedAt: new Date().toISOString().slice(0, 10),
              generatedBy: "ai",
              questions,
            }),
            "utf8",
          );
          console.log(
            `Homepage long-term focus generated by AI from ${evidence.length} public evidence items attempt=${attempt}/${aiMaxAttempts}.`,
          );
          return;
        }
      } catch (error) {
        failureReason = error instanceof Error ? error.message : String(error);
        console.warn(
          `[home-focus] AI attempt ${attempt}/${aiMaxAttempts} failed: ${failureReason}`,
        );
      }
    }
  }

  try {
    await fs.access(outputPath);
    const reason = missing.length > 0
      ? `missing configuration: ${missing.join(", ")}`
      : failureReason || "AI returned no usable result";
    console.log(`[home-focus] keeping committed snapshot; reason=${reason}`);
  } catch {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(
      outputPath,
      serializeSnapshot({
        generatedAt: new Date().toISOString().slice(0, 10),
        generatedBy: "fallback",
        questions: fallbackQuestions,
      }),
      "utf8",
    );
    console.log("[home-focus] snapshot missing; wrote deterministic fallback.");
  }
}

await main();
