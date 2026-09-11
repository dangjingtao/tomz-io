from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"missing expected block: {label}")
    return text.replace(old, new, 1)


# App: consume the shared site model instead of rebuilding site structure locally.
app_path = ROOT / "src/App.tsx"
app = app_path.read_text(encoding="utf-8")
imports_end = "const themeOptions: { name: ThemeName; label: string }[] = [\n"
if imports_end not in app:
    raise RuntimeError("App import boundary not found")
_, remainder = app.split(imports_end, 1)
app = """import { useEffect, useMemo, useState } from \"react\";
import NotFoundPage from \"./components/NotFoundPage\";
import PwaUpdatePrompt from \"./components/PwaUpdatePrompt\";
import RenderedMarkdown from \"./components/RenderedMarkdown\";
import SearchOverlay from \"./components/SearchOverlay\";
import ShareButton from \"./components/ShareButton\";
import SiteHeader from \"./components/SiteHeader\";
import { allDocs, compareDocs } from \"./content/mira-docs-adapter\";
import {
  blogNavCategories,
  githubUrl,
  siteAreas,
  siteNav,
  siteTitle,
  tomzMarkSrc,
} from \"./content/site-model\";
import { bookEntries, books } from \"./content/bookshelf\";
import AboutPage from \"./features/about/AboutPage\";
import BookshelfHub from \"./features/bookshelf/BookshelfHub\";
import { BlogListPage, BlogPostPage } from \"./features/blog/BlogPages\";
import DocsLayout from \"./features/docs/DocsLayout\";
import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectIdFromPath,
} from \"./features/docs/docs-utils\";
import { WeeklyIssuePage, WeeklyListPage } from \"./features/weekly/WeeklyPages\";
import { weeklyIssueNumber } from \"./features/weekly/weekly-utils\";
import HomepageV1, { HomepageFooter } from \"./HomepageV1\";
import { FileQuestion } from \"lucide-react\";
import { Link, Route, Routes, useLocation } from \"react-router-dom\";
import type { SiteArea, ThemeName } from \"./types/site\";
import { renderMarkdown } from \"./utils/markdown\";
import { getPageTitle } from \"./utils/page-title\";
import { appBase } from \"./utils/paths\";

const themeOptions: { name: ThemeName; label: string }[] = [
""" + remainder

model_start = "const githubUrl = githubProfileUrl;\n"
model_end = "\n\n\n\n\n\n\n\n\n\nfunction RoutedApp()"
if model_start not in app or model_end not in app:
    raise RuntimeError("App local site-model block not found")
start = app.index(model_start)
end = app.index(model_end, start)
app = app[:start] + "function RoutedApp()" + app[end + len(model_end):]
app = app.replace("nav={content.nav}", "nav={siteNav}")
app = app.replace("const scopedArticleDocs = articleDocs", "const scopedArticleDocs = allDocs")
app = app.replace("const weeklyDocs = articleDocs", "const weeklyDocs = allDocs")
app_path.write_text(app, encoding="utf-8")


# Blog: share only active-heading behavior; keep blog markup and CSS untouched.
blog_path = ROOT / "src/features/blog/BlogPages.tsx"
blog = blog_path.read_text(encoding="utf-8")
blog = replace_once(
    blog,
    'import { renderMarkdown } from "../../utils/markdown";\n',
    'import { useActiveHeading } from "../../hooks/useActiveHeading";\nimport { renderMarkdown } from "../../utils/markdown";\n',
    "blog hook import",
)
blog_start = '  const [activeHeading, setActiveHeading] = useState("");\n'
blog_end = '  useEffect(() => {\n    const mobileQuery = window.matchMedia("(max-width: 760px)");\n'
if blog_start not in blog or blog_end not in blog:
    raise RuntimeError("blog active-heading block not found")
start = blog.index(blog_start)
end = blog.index(blog_end, start)
replacement = '''  const activeHeading = useActiveHeading(doc.headings, {
    rootMargin: "-120px 0px -65% 0px",
  });
'''
blog = blog[:start] + replacement + blog[end:]
blog_path.write_text(blog, encoding="utf-8")


# Docs: share active-heading behavior and disable the observer entirely for editorial layouts.
docs_path = ROOT / "src/features/docs/DocsLayout.tsx"
docs = docs_path.read_text(encoding="utf-8")
docs = replace_once(
    docs,
    'import type { SiteArea } from "../../types/site";\n',
    'import type { SiteArea } from "../../types/site";\nimport { useActiveHeading } from "../../hooks/useActiveHeading";\n',
    "docs hook import",
)
docs = replace_once(
    docs,
    '  const [activeHeading, setActiveHeading] = useState("");\n',
    '''  const activeHeading = useActiveHeading(currentDoc?.headings, {
    enabled: !isEditorialArea,
    rootMargin: "-90px 0px -65% 0px",
  });
''',
    "docs active heading state",
)
observer_start = '  useEffect(() => {\n    const nodes = currentDoc?.headings\n'
return_marker = '  return (\n'
if observer_start not in docs:
    raise RuntimeError("docs observer block not found")
start = docs.index(observer_start)
end = docs.index(return_marker, start)
docs = docs[:start] + docs[end:]
docs_path.write_text(docs, encoding="utf-8")

print("shared layers wired: site model + active heading hook")
