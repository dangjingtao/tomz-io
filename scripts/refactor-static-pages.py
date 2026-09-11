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

# 1. Extract the site-wide 404 page.
not_found, app = cut(app, "function NotFoundPage(", "\n\n\n\nfunction RoutedApp(")
not_found = not_found.replace("function NotFoundPage(", "export default function NotFoundPage(", 1)
write_new(
    "src/components/NotFoundPage.tsx",
    'import { useEffect } from "react";\n'
    'import { Link, useLocation } from "react-router-dom";\n'
    'import { decodedPathname } from "../utils/paths";\n\n'
    + not_found.rstrip()
    + "\n",
)

# 2. Extract About as a feature page.
about, app = cut(app, "function AboutPage()", "\n\nfunction DocPage(")
about = about.replace("function AboutPage()", "export default function AboutPage()", 1)
write_new(
    "src/features/about/AboutPage.tsx",
    'import { ArrowUpRight } from "lucide-react";\n'
    'import { Link } from "react-router-dom";\n'
    'import { authorProfiles } from "../../content/author-profiles";\n'
    'import { githubProfileUrl } from "../../site.config";\n'
    'import { handleMiraAvatarError } from "../../utils/avatar";\n\n'
    + about.rstrip()
    + "\n",
)

# 3. Wire components into App.
anchor = 'import PwaUpdatePrompt from "./components/PwaUpdatePrompt";\n'
if anchor not in app:
    raise RuntimeError("component import anchor not found")
app = app.replace(anchor, anchor + 'import NotFoundPage from "./components/NotFoundPage";\n', 1)
anchor = 'import DocsLayout from "./features/docs/DocsLayout";\n'
if anchor not in app:
    raise RuntimeError("feature import anchor not found")
app = app.replace(anchor, anchor + 'import AboutPage from "./features/about/AboutPage";\n', 1)
APP.write_text(app, encoding="utf-8")

# 4. Move 404 styles out of shared styles.css.
not_found_css, styles = cut(styles, ".not-found-page{", "\n.share-button{")
mobile_start = "@media(max-width:560px){.not-found-page{"
mobile_end = "\n@media(min-width:821px){.share-button"
not_found_mobile, styles = cut(styles, mobile_start, mobile_end)
write_new(
    "src/styles/not-found.css",
    "/* Site-wide 404 page. */\n"
    + not_found_css.strip()
    + "\n"
    + not_found_mobile.strip()
    + "\n",
)

# 5. About styles already form a tail section; move the whole section intact.
about_marker = "/* About page */"
if about_marker not in styles:
    raise RuntimeError("About CSS marker not found")
i = styles.index(about_marker)
about_css = styles[i:]
styles = styles[:i]
write_new("src/styles/about-page.css", about_css.strip() + "\n")
STYLES.write_text(styles, encoding="utf-8")

style_anchor = 'import "./styles/search-overlay.css";\n'
if style_anchor not in main:
    raise RuntimeError("main.tsx style import anchor not found")
main = main.replace(
    style_anchor,
    style_anchor
    + 'import "./styles/not-found.css";\n'
    + 'import "./styles/about-page.css";\n',
    1,
)
MAIN.write_text(main, encoding="utf-8")

print(
    f"App.tsx: {original_app_lines} -> {len(app.splitlines())} lines; "
    f"styles.css: {original_style_lines} -> {len(styles.splitlines())} lines"
)
