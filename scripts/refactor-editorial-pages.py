from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "src/App.tsx"


def cut(text: str, start: str, end: str):
    if start not in text:
        raise RuntimeError(f"start marker not found: {start}")
    i = text.index(start)
    if end not in text[i:]:
        raise RuntimeError(f"end marker not found after {start}: {end}")
    j = text.index(end, i)
    return text[i:j], text[:i] + text[j:]


def write_new(relative: str, content: str):
    path = ROOT / relative
    if path.exists():
        raise RuntimeError(f"refusing to overwrite existing file: {relative}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


app = APP.read_text(encoding="utf-8")
original_lines = len(app.splitlines())

# Blog list/detail components.
blog, app = cut(app, "function BlogHeaderVisual()", "\nfunction WeeklyListPage(")
blog = blog.replace("function BlogListPage(", "export function BlogListPage(", 1)
blog = blog.replace("function BlogPostPage(", "export function BlogPostPage(", 1)
write_new(
    "src/features/blog/BlogPages.tsx",
    'import { useEffect, useMemo, useState } from "react";\n'
    'import { Link, useLocation, useNavigate } from "react-router-dom";\n'
    'import AuthorSignature from "../../components/AuthorSignature";\n'
    'import RenderedMarkdown from "../../components/RenderedMarkdown";\n'
    'import ShareButton from "../../components/ShareButton";\n'
    'import { authorProfiles } from "../../content/author-profiles";\n'
    'import { compareBlogDocs, type Doc } from "../../content/mira-docs-adapter";\n'
    'import { resolveCoverSource } from "../article/article-cover";\n'
    'import type { SiteArea } from "../../types/site";\n'
    'import { handleMiraAvatarError } from "../../utils/avatar";\n'
    'import {\n'
    '  getDocAuthorAvatars,\n'
    '  getDocAuthorLabel,\n'
    '  getDocAuthors,\n'
    '  getDocSignature,\n'
    '} from "../../utils/authors";\n'
    'import { renderMarkdown } from "../../utils/markdown";\n\n'
    + blog.rstrip()
    + "\n",
)

# Weekly index/issue components.
weekly, app = cut(app, "function WeeklyListPage(", "\nfunction AreaPage(")
weekly = weekly.replace("function WeeklyListPage(", "export function WeeklyListPage(", 1)
weekly = weekly.replace("function WeeklyIssuePage(", "export function WeeklyIssuePage(", 1)
write_new(
    "src/features/weekly/WeeklyPages.tsx",
    'import { Link } from "react-router-dom";\n'
    'import RenderedMarkdown from "../../components/RenderedMarkdown";\n'
    'import ShareButton from "../../components/ShareButton";\n'
    'import { compareWeeklyDocs, type Doc } from "../../content/mira-docs-adapter";\n'
    'import type { SiteArea } from "../../types/site";\n'
    'import { getDocAuthorLabel } from "../../utils/authors";\n'
    'import { weeklyDateLabel, weeklyDisplayTitle, weeklyIssueNumber } from "./weekly-utils";\n\n'
    + weekly.rstrip()
    + "\n",
)

# Wire the new feature modules into App.tsx.
anchor = 'import DocsLayout from "./features/docs/DocsLayout";\n'
if anchor not in app:
    raise RuntimeError("editorial import anchor not found")
imports = (
    'import { BlogListPage, BlogPostPage } from "./features/blog/BlogPages";\n'
    'import { WeeklyIssuePage, WeeklyListPage } from "./features/weekly/WeeklyPages";\n'
)
app = app.replace(anchor, anchor + imports, 1)
APP.write_text(app, encoding="utf-8")

print(f"App.tsx: {original_lines} -> {len(app.splitlines())} lines")
