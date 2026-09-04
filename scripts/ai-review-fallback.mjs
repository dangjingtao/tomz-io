import fs from "node:fs";
import { execFileSync } from "node:child_process";

const marker = "<!-- custom-ai-review-fallback -->";
const apiBase = "https://api.github.com";
const token = process.env.GITHUB_TOKEN;
const aiBase = (process.env.AI_REVIEW_BASE_URL || "").replace(/\/+$/, "");
const aiKey = process.env.AI_REVIEW_API_KEY || "";
const aiModel = process.env.AI_REVIEW_MODEL || "";

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

requireEnv("GITHUB_TOKEN", token);
requireEnv("AI_REVIEW_BASE_URL", aiBase);
requireEnv("AI_REVIEW_API_KEY", aiKey);
requireEnv("AI_REVIEW_MODEL", aiModel);

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const pr = event.pull_request;
if (!pr) throw new Error("This script must run from a pull_request event.");

const ownerRepo = process.env.GITHUB_REPOSITORY;
const [owner, repo] = ownerRepo.split("/");
const prNumber = pr.number;
const headSha = pr.head.sha;
const baseSha = pr.base.sha;

async function github(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ${path}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body;
}

async function waitForRabbit() {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const combined = await github(`/repos/${owner}/${repo}/commits/${headSha}/status`);
    const rabbit = (combined.statuses || []).find((item) => item.context === "CodeRabbit");
    if (rabbit) {
      const description = String(rabbit.description || "");
      console.log(`CodeRabbit status: state=${rabbit.state} description=${description}`);
      if (/rate limited/i.test(description)) return { fallback: true, reason: description };
      if (rabbit.state === "success" && /review completed/i.test(description)) {
        return { fallback: false, reason: description };
      }
      if (rabbit.state === "failure" || rabbit.state === "error") {
        return { fallback: true, reason: description || rabbit.state };
      }
    } else {
      console.log(`CodeRabbit status not present yet (attempt ${attempt}/10).`);
    }
    if (attempt < 10) await new Promise((resolve) => setTimeout(resolve, 15000));
  }
  return { fallback: true, reason: "CodeRabbit did not complete within fallback window" };
}

function readRule(path, max = 14000) {
  if (!fs.existsSync(path)) return "";
  const content = fs.readFileSync(path, "utf8");
  return content.length > max ? `${content.slice(0, max)}\n...[truncated]` : content;
}

function collectDiff() {
  const args = [
    "diff",
    "--no-ext-diff",
    "--unified=60",
    `${baseSha}...${headSha}`,
    "--",
    ".",
    ":(exclude)package-lock.json",
    ":(exclude)pnpm-lock.yaml",
    ":(exclude)*.svg",
    ":(exclude)*.png",
    ":(exclude)*.jpg",
    ":(exclude)*.jpeg",
    ":(exclude)*.webp",
  ];
  const diff = execFileSync("git", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  const max = 100000;
  return diff.length > max ? `${diff.slice(0, max)}\n...[diff truncated]` : diff;
}

function parseModelJson(raw) {
  let text = String(raw || "").trim();
  text = text.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) text = text.slice(first, last + 1);
  const parsed = JSON.parse(text);
  if (!["APPROVE", "REQUEST_CHANGES"].includes(parsed.verdict)) {
    throw new Error(`Invalid verdict: ${parsed.verdict}`);
  }
  parsed.findings = Array.isArray(parsed.findings) ? parsed.findings : [];
  parsed.summary = String(parsed.summary || "").trim();
  return parsed;
}

function formatComment(review, reason) {
  const findings = review.findings.length
    ? review.findings.map((f, index) => {
        const sev = f.severity === "blocking" ? "BLOCKING" : "WARNING";
        const where = f.path ? ` — \`${f.path}${f.line ? `:${f.line}` : ""}\`` : "";
        return `${index + 1}. **[${sev}] ${f.title || "Finding"}**${where}\n   ${f.detail || ""}`;
      }).join("\n\n")
    : "No findings.";

  return `${marker}
## Custom AI Review fallback

**Verdict:** \`${review.verdict}\`  
**Fallback reason:** ${reason}

${review.summary || ""}

### Findings

${findings}

---
OpenAI-compatible reviewer: \`${aiModel}\`. This review runs only when CodeRabbit is rate-limited, unavailable, or does not finish inside the fallback window.
`;
}

async function upsertComment(body) {
  const comments = await github(`/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`);
  const existing = comments.find((item) => typeof item.body === "string" && item.body.includes(marker));
  if (existing) {
    await github(`/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
  } else {
    await github(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
  }
}

async function submitReview(review, body) {
  const eventName = review.verdict === "APPROVE" ? "APPROVE" : "REQUEST_CHANGES";
  try {
    await github(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: eventName, body }),
    });
    console.log(`Submitted GitHub PR review: ${eventName}`);
    return true;
  } catch (error) {
    console.error(`Could not submit PR review: ${error.message}`);
    return false;
  }
}

const rabbit = await waitForRabbit();
if (!rabbit.fallback) {
  console.log(`CodeRabbit completed normally; custom AI fallback skipped: ${rabbit.reason}`);
  process.exit(0);
}

const rules = [
  ["AGENTS.md", readRule("AGENTS.md")],
  ["docs/AUTHORSHIP.md", readRule("docs/AUTHORSHIP.md", 10000)],
  ["docs/CONTENT_ARCHITECTURE.md", readRule("docs/CONTENT_ARCHITECTURE.md", 12000)],
  ["docs/PROJECT_ARCHITECTURE.md", readRule("docs/PROJECT_ARCHITECTURE.md", 10000)],
].filter(([, content]) => content);

const diff = collectDiff();
if (!diff.trim()) {
  console.log("No reviewable textual diff found.");
  process.exit(0);
}

const system = `You are the fallback pull-request reviewer for tomz.io.
Review independently and conservatively. Repository rules supplied below are binding.
Focus on correctness, regression risk, security/privacy, content/URL/canonical integrity,
authorship rules, build/deploy contracts, and misleading documentation.
Do not invent requirements. Do not request changes for style-only preferences.
Return JSON only with this schema:
{
  "verdict": "APPROVE" | "REQUEST_CHANGES",
  "summary": "short review summary",
  "findings": [
    {
      "severity": "blocking" | "warning",
      "path": "repo-relative path or empty",
      "line": number | null,
      "title": "short title",
      "detail": "specific evidence and required fix"
    }
  ]
}
Use REQUEST_CHANGES only when at least one blocking issue exists.`;

const prompt = `Repository: ${ownerRepo}
PR #${prNumber}: ${pr.title}
Base: ${baseSha}
Head: ${headSha}

Fallback reason: ${rabbit.reason}

Repository rules:
${rules.map(([name, content]) => `\n--- ${name} ---\n${content}`).join("\n")}

Pull request diff:
--- DIFF START ---
${diff}
--- DIFF END ---
`;

const response = await fetch(`${aiBase}/chat/completions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${aiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: aiModel,
    temperature: 0,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  }),
});

const rawBody = await response.text();
if (!response.ok) {
  throw new Error(`AI endpoint returned ${response.status}: ${rawBody.slice(0, 500)}`);
}

let payload;
try { payload = JSON.parse(rawBody); } catch { throw new Error("AI endpoint returned non-JSON response envelope."); }
const content = payload?.choices?.[0]?.message?.content;
if (!content) throw new Error("AI response did not contain choices[0].message.content.");

const review = parseModelJson(content);
const commentBody = formatComment(review, rabbit.reason);
await upsertComment(commentBody);

const submitted = await submitReview(review, `Custom AI fallback review: ${review.summary || review.verdict}\n\nSee the detailed fallback review comment on this PR.`);

if (review.verdict === "REQUEST_CHANGES") {
  throw new Error("Custom AI fallback found blocking issues.");
}
if (!submitted) {
  throw new Error("Custom AI approved the change, but GitHub did not allow the workflow token to submit an APPROVE review. Enable 'Allow GitHub Actions to create and approve pull requests' or use this job as a required status check.");
}

console.log("Custom AI fallback approved this PR.");
