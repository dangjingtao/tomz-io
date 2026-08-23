import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "src/content/home-focus.generated.ts");
const contentRoots = [
  { root: "blogs", dir: path.join(root, "src/pages/blogs") },
  { root: "projects", dir: path.join(root, "src/pages/projects") },
  { root: "books", dir: path.join(root, "src/pages/books") },
];

const aiBaseUrl = process.env.HOMEPAGE_AI_BASE_URL?.replace(/\/+$/, "");
const aiApiKey = process.env.HOMEPAGE_AI_API_KEY;
const aiModel = process.env.HOMEPAGE_AI_MODEL;
const refreshIntervalDays = 7;
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

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced || text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response did not contain JSON");

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch (error) {
    throw new Error(`AI JSON parse failed: ${error instanceof Error ? error.message : error}`);
  }
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

function compactLogPreview(value, limit = 240) {
  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function missingAiConfiguration() {
  const missing = [];
  if (!aiBaseUrl) missing.push("HOMEPAGE_AI_BASE_URL");
  if (!aiApiKey) missing.push("HOMEPAGE_AI_API_KEY");
  if (!aiModel) missing.push("HOMEPAGE_AI_MODEL");
  return missing;
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

async function generateWithAi(evidence) {
  const missing = missingAiConfiguration();
  if (missing.length > 0) return null;

  const prompt = `你在为 Tomz Dang 的个人网站 tomz.io 提炼“长期关注”的问题。\n\n这不是人格生成，也不是替 Tomz 决定他应该关心什么。你只能从公开内容中观察长期、反复出现的主题，并把它们写成 4 到 6 个没有标准答案的问题。\n\n要求：\n1. 每个问题必须能从多个不同内容条目中找到支持；不要因为单篇偶发内容新增长期主题。\n2. 主题类别完全开放，不预设技术、生活、创作或价值方向；只按证据归纳。\n3. 不要把 Tomz 写成专家、思想领袖或某种固定人格。\n4. 不写结论，只写开放问题。\n5. 措辞克制、自然、具体，每条不超过 42 个汉字；尽量保持长期稳定，不追逐短期热点。\n6. 不要机械复制标题，不要输出解释或证据列表。\n\n输出纯 JSON：{"questions":["问题1。","问题2。"]}\n\n公开内容证据：\n${JSON.stringify(evidence, null, 2)}`;

  console.log(
    `[home-focus] request model=${aiModel} evidence=${evidence.length} promptChars=${prompt.length} promptBytes=${Buffer.byteLength(prompt, "utf8")}`,
  );

  const response = await fetch(`${aiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: aiModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "你是谨慎的个人网站编辑，只能从公开材料中归纳长期主题，不能定义作者人格。",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  console.log(`[home-focus] response status=${response.status} ok=${response.ok}`);

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(
      `AI endpoint returned ${response.status}; body=${compactLogPreview(responseBody, 320) || "<empty>"}`,
    );
  }

  let payload;
  try {
    payload = JSON.parse(responseBody);
  } catch (error) {
    throw new Error(`AI HTTP response was not JSON: ${error instanceof Error ? error.message : error}`);
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI response was empty");

  console.log(
    `[home-focus] completion chars=${text.length} preview=${JSON.stringify(compactLogPreview(text))}`,
  );

  const parsed = extractJson(text);
  const questions = validateQuestions(parsed);
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

  const missing = missingAiConfiguration();
  if (missing.length > 0) {
    console.warn(`[home-focus] AI configuration missing: ${missing.join(", ")}`);
  }

  let failureReason = "";
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
      console.log(`Homepage long-term focus generated by AI from ${evidence.length} public evidence items.`);
      return;
    }
  } catch (error) {
    failureReason = error instanceof Error ? error.message : String(error);
    console.warn(`[home-focus] AI generation failed: ${failureReason}`);
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
