from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "src/App.tsx"
MAIN = ROOT / "src/main.tsx"
STYLES = ROOT / "src/styles.css"


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
main = MAIN.read_text(encoding="utf-8")
styles = STYLES.read_text(encoding="utf-8")
original_app_lines = len(app.splitlines())
original_style_lines = len(styles.splitlines())

# 1. Low-coupling shared components.
rendered, app = cut(app, "function RenderedMarkdown(", "\n\nconst content = {")
rendered = rendered.replace(
    "function RenderedMarkdown(", "export default function RenderedMarkdown(", 1
)
write_new(
    "src/components/RenderedMarkdown.tsx",
    'import { useEffect, useRef } from "react";\n\n' + rendered.rstrip() + "\n",
)

share, app = cut(app, "function ShareButton(", "\n\nfunction PwaUpdatePrompt(")
share = share.replace("function ShareButton(", "export default function ShareButton(", 1)
write_new(
    "src/components/ShareButton.tsx",
    'import { useState } from "react";\nimport { Share2 } from "lucide-react";\n\n'
    + share.rstrip()
    + "\n",
)

pwa, app = cut(app, "function PwaUpdatePrompt(", "\nfunction SiteHeaderBase(")
pwa = pwa.replace(
    "function PwaUpdatePrompt(", "export default function PwaUpdatePrompt(", 1
)
write_new(
    "src/components/PwaUpdatePrompt.tsx",
    'import { useEffect, useState } from "react";\n\n' + pwa.rstrip() + "\n",
)

search, app = cut(app, "function SearchOverlay(", "\n\nfunction RoutedApp(")
search = search.replace("function SearchOverlay(", "export default function SearchOverlay(", 1)
search = search.replace("articleDocs", "allDocs")
write_new(
    "src/components/SearchOverlay.tsx",
    'import {\n'
    '  useEffect,\n'
    '  useMemo,\n'
    '  useRef,\n'
    '  useState,\n'
    '  type KeyboardEvent as ReactKeyboardEvent,\n'
    '} from "react";\n'
    'import { Link, useNavigate } from "react-router-dom";\n'
    'import { allDocs } from "../content/mira-docs-adapter";\n\n'
    + search.rstrip()
    + "\n",
)

# 2. Documentation navigation/layout as a feature boundary.
docs_layout, app = cut(app, "function AreaDocNav(", "\nfunction BlogListPage(")
docs_layout = docs_layout.replace(
    "function DocsLayout() {",
    "export default function DocsLayout({ siteAreas }: { siteAreas: SiteArea[] }) {",
    1,
)
write_new(
    "src/features/docs/DocsLayout.tsx",
    'import { useEffect, useState } from "react";\n'
    'import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";\n'
    'import { Link, Outlet, useLocation } from "react-router-dom";\n'
    'import { allDocs, type Doc } from "../../content/mira-docs-adapter";\n'
    'import type { SiteArea } from "../../types/site";\n'
    'import { decodedPathname } from "../../utils/paths";\n'
    'import {\n'
    '  directoryTitle,\n'
    '  docsByDirectory,\n'
    '  docsByProjectDirectory,\n'
    '  isProjectArea,\n'
    '  projectNavTitle,\n'
    '} from "./docs-utils";\n\n'
    + docs_layout.rstrip()
    + "\n",
)

# 3. Wire the new component boundaries into App.tsx.
anchor = 'import AuthorSignature from "./components/AuthorSignature";\n'
if anchor not in app:
    raise RuntimeError("App import anchor not found")
component_imports = (
    'import PwaUpdatePrompt from "./components/PwaUpdatePrompt";\n'
    'import RenderedMarkdown from "./components/RenderedMarkdown";\n'
    'import SearchOverlay from "./components/SearchOverlay";\n'
    'import ShareButton from "./components/ShareButton";\n'
    'import DocsLayout from "./features/docs/DocsLayout";\n'
)
app = app.replace(anchor, anchor + component_imports, 1)
app = app.replace("  type KeyboardEvent as ReactKeyboardEvent,\n", "", 1)
app = app.replace("  Share2,\n", "", 1)
if '<Route element={<DocsLayout />}>' not in app:
    raise RuntimeError("DocsLayout route anchor not found")
app = app.replace(
    '<Route element={<DocsLayout />}>',
    '<Route element={<DocsLayout siteAreas={siteAreas} />}>',
    1,
)
APP.write_text(app, encoding="utf-8")

# 4. Split component-specific overlay CSS out of the old catch-all stylesheet.
pwa_css, styles = cut(
    styles,
    "    .pwa-update-overlay {",
    "\n@media (max-width:560px) {\n      .theme-toggle",
)
write_new(
    "src/styles/pwa-update.css",
    "/* PWA update prompt. */\n" + pwa_css.strip() + "\n",
)

search_css, styles = cut(
    styles,
    "/* Global document search */",
    "\n.docs-mobile-bar,.mobile-docs-overlay,.mobile-page-toc{display:none}",
)
write_new(
    "src/styles/search-overlay.css",
    search_css.strip() + "\n",
)
STYLES.write_text(styles, encoding="utf-8")

style_anchor = 'import "./styles.css";\n'
if style_anchor not in main:
    raise RuntimeError("main.tsx styles import anchor not found")
main = main.replace(
    style_anchor,
    style_anchor
    + 'import "./styles/pwa-update.css";\n'
    + 'import "./styles/search-overlay.css";\n',
    1,
)
MAIN.write_text(main, encoding="utf-8")

print(
    f"App.tsx: {original_app_lines} -> {len(app.splitlines())} lines; "
    f"styles.css: {original_style_lines} -> {len(styles.splitlines())} lines"
)
