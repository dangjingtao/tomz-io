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
  return JSON.parse(candidate.slice(start, end + 1));
}

function validateQuestions(value) {
  if (!Array.isArray(value?.questions) || value.questions.length < 4 || value.questions.length > 6) {
    throw new Error("AI response must contain 4 to 6 questions");
  }
  const questions = value.questions.map((item) => String(item).trim()).filter(Boolean);
  if (questions.length < 4 || questions.length > 6) throw new Error("Invalid question count");
  if (questions.some((item) => item.length > 42)) throw new Error("Question is too long");
  return questions;
}

async function generateWithAi(evidence) {
  if (!aiBaseUrl || !aiApiKey || !aiModel) return null;

  const prompt = `你在为 Tomz Dang 的个人网站 tomz.io 提炼“长期关注”的问题。\n\n这不是人格生成，也不是替 Tomz 决定他应该关心什么。你只能从公开内容中观察长期、反复出现的主题，并把它们写成 4 到 6 个没有标准答案的问题。\n\n要求：\n1. 每个问题必须能从多个不同内容条目中找到支持；不要因为单篇偶发内容新增长期主题。\n2. 可以识别技术、产品、设计、工作、生活、创作、信仰等主题，但只能在证据足够时出现。\n3. 不要把 Tomz 写成专家、思想领袖或某种固定人格。\n4. 不写结论，只写开放问题。\n5. 措辞克制、自然、具体，每条不超过 42 个汉字；尽量保持长期稳定，不追逐短期热点。\n6. 不要机械复制标题，不要输出解释或证据列表。\n\n输出纯 JSON：{"questions":["问题1。","问题2。"]}\n\n公开内容证据：\n${JSON.stringify(evidence, null, 2)}`;

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

  if (!response.ok) throw new Error(`AI endpoint returned ${response.status}`);
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI response was empty");
  return validateQuestions(extractJson(text));
}

function serializeSnapshot({ generatedAt, generatedBy, questions }) {
  return `export const homeFocusSnapshot = {\n  generatedAt: ${JSON.stringify(generatedAt)},\n  generatedBy: ${JSON.stringify(generatedBy)} as const,\n  questions: ${JSON.stringify(questions, null, 2)} as string[],\n};\n`;
}

async function main() {
  const evidence = await collectEvidence();

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
    console.warn(`Homepage focus AI failed: ${error instanceof Error ? error.message : error}`);
  }

  try {
    await fs.access(outputPath);
    console.log("Homepage focus AI credentials unavailable; keeping committed snapshot as fallback.");
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
    console.log("Homepage focus snapshot missing; wrote deterministic fallback.");
  }
}

await main();
