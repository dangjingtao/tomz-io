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

# 1. Move the shared site header into its own component without changing behavior.
header, app = cut(app, "function SiteHeaderBase(", "\nfunction NotFoundPage(")
header = header.replace(
    "function SiteHeaderBase({\n  onSearch,",
    "export default function SiteHeader({\n  nav,\n  blogNavCategories,\n  githubUrl,\n  tomzMarkSrc,\n  appBase,\n  onSearch,",
    1,
)
header = header.replace(
    "}: {\n  onSearch: () => void;",
    "}: {\n  nav: LinkItem[];\n  blogNavCategories: { label: string; count: number }[];\n  githubUrl: string;\n  tomzMarkSrc: string;\n  appBase: string;\n  onSearch: () => void;",
    1,
)
header = header.replace("content.nav", "nav")
write_new(
    "src/components/SiteHeader.tsx",
    'import { useEffect, useRef, useState } from "react";\n'
    'import {\n'
    '  Archive,\n'
    '  BookOpen,\n'
    '  ChevronDown,\n'
    '  Code2,\n'
    '  Compass,\n'
    '  Lightbulb,\n'
    '  Menu,\n'
    '  Moon,\n'
    '  Network,\n'
    '  Sparkles,\n'
    '  Sun,\n'
    '  X,\n'
    '} from "lucide-react";\n'
    'import { Link, useLocation } from "react-router-dom";\n'
    'import type { LinkItem } from "../types/site";\n\n'
    + header.rstrip()
    + "\n",
)

anchor = 'import ShareButton from "./components/ShareButton";\n'
if anchor not in app:
    raise RuntimeError("SiteHeader import anchor not found")
app = app.replace(anchor, anchor + 'import SiteHeader from "./components/SiteHeader";\n', 1)
if "<SiteHeaderBase\n" not in app:
    raise RuntimeError("SiteHeaderBase usage not found")
app = app.replace(
    "<SiteHeaderBase\n",
    "<SiteHeader\n"
    "        nav={content.nav}\n"
    "        blogNavCategories={blogNavCategories}\n"
    "        githubUrl={githubUrl}\n"
    "        tomzMarkSrc={tomzMarkSrc}\n"
    "        appBase={appBase}\n",
    1,
)
APP.write_text(app, encoding="utf-8")

# 2. Move header-specific CSS out of the old catch-all stylesheet.
nav_css, styles = cut(styles, "    /* nav */", "\n    .btn {")
controls_css, styles = cut(styles, "    .header-github {", "\n    /* hero */")
mobile_css, styles = cut(
    styles,
    "@media (max-width:560px) {\n      .theme-toggle",
    "\n/* Shared documentation layout styles. */",
)
write_new(
    "src/styles/site-header.css",
    "/* Shared Tomz.io site header. */\n\n"
    + nav_css.strip()
    + "\n\n"
    + controls_css.strip()
    + "\n\n"
    + mobile_css.strip()
    + "\n",
)
STYLES.write_text(styles, encoding="utf-8")

style_anchor = 'import "./styles.css";\n'
if style_anchor not in main:
    raise RuntimeError("main.tsx styles import anchor not found")
main = main.replace(style_anchor, style_anchor + 'import "./styles/site-header.css";\n', 1)
MAIN.write_text(main, encoding="utf-8")

print(
    f"App.tsx: {original_app_lines} -> {len(app.splitlines())} lines; "
    f"styles.css: {original_style_lines} -> {len(styles.splitlines())} lines"
)
