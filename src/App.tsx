import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type SyntheticEvent,
} from "react";
import { marked } from "marked";
import AuthorSignature from "./components/AuthorSignature";
import hljs from "highlight.js/lib/common";
import {
  ArrowUpRight,
  Archive,
  BookOpen,
  ChevronDown,
  Code2,
  Compass,
  Cpu,
  ChevronUp,
  FileCode2,
  FileQuestion,
  GitBranch,
  Lightbulb,
  Menu,
  Moon,
  Network,
  Share2,
  Sparkles,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  authorAvatarUrl,
  githubProfileUrl,
  miraAvatarUrl,
  siteName,
  topNavigationOrder,
} from "./site.config";
import {
  allDocs,
  pageDirectories,
  compareBlogDocs,
  compareDocs,
  slug,
  type AuthorKey,
  type Doc,
} from "./content/mira-docs-adapter";
import HomepageV1, { HomepageFooter } from "./HomepageV1";

type LinkItem = { label: string; href: string };
type ThemeName = "claude" | "apple" | "supabase";
const themeOptions: { name: ThemeName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "apple", label: "Apple" },
  { name: "supabase", label: "Supabase" },
];
type SiteArea = {
  key: string;
  title: string;
  description: string;
  docs: Doc[];
  path: string;
  href: string;
};
const githubUrl = githubProfileUrl;
const appBase = import.meta.env.BASE_URL;
function navigationDirectory(doc: Doc) {
  return doc.directory;
}
function docHref(path: string) {
  return `${appBase}${path.replace(/^\/+/, "")}`;
}
function decodedPathname(path: string) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function seedFromString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let temp = Math.imul(value ^ (value >>> 15), 1 | value);
    temp = (temp + Math.imul(temp ^ (temp >>> 7), 61 | temp)) ^ temp;
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}
function range(rand: () => number, min: number, max: number) {
  return min + rand() * (max - min);
}
function generateOrbitCoverSvg(seed: string) {
  const rand = mulberry32(seedFromString(seed));
  const width = 1200;
  const height = 520;
  const cx = width / 2;
  const cy = height * 0.52;
  const accentColors = ["#cc785c", "#5db8a6", "#e8a55a", "#6b8fb0"];
  const accent = accentColors[Math.floor(rand() * accentColors.length)];
  const neutralRing = "#d9cfbd";
  const ringA = {
    rx: range(rand, width * 0.32, width * 0.42),
    ry: range(rand, height * 0.16, height * 0.24),
    rot: range(rand, -18, 18),
    dur: Math.round(range(rand, 40, 70)),
    dir: rand() > 0.5 ? "normal" : "reverse",
  };
  const ringB = {
    rx: range(rand, width * 0.22, width * 0.3),
    ry: range(rand, height * 0.22, height * 0.32),
    rot: range(rand, -18, 18),
    dur: Math.round(range(rand, 40, 70)),
    dir: rand() > 0.5 ? "normal" : "reverse",
  };
  const badgeR = width * 0.07;
  const dotAngle = range(rand, 0, Math.PI * 2);
  const dotR = badgeR * 0.28;
  const dotX = cx + Math.cos(dotAngle) * badgeR * 0.4;
  const dotY = cy + Math.sin(dotAngle) * badgeR * 0.4;
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .ring { transform-box: fill-box; transform-origin: center; fill: none; }
    @keyframes spin-n { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spin-r { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
  </style>
  <ellipse class="ring" style="animation:${ringA.dir === "normal" ? "spin-n" : "spin-r"} ${ringA.dur}s linear infinite" cx="${cx}" cy="${cy}" rx="${ringA.rx.toFixed(1)}" ry="${ringA.ry.toFixed(1)}" stroke="${neutralRing}" stroke-width="1.2" transform="rotate(${ringA.rot.toFixed(1)} ${cx} ${cy})"/>
  <ellipse class="ring" style="animation:${ringB.dir === "normal" ? "spin-n" : "spin-r"} ${ringB.dur}s linear infinite" cx="${cx}" cy="${cy}" rx="${ringB.rx.toFixed(1)}" ry="${ringB.ry.toFixed(1)}" stroke="${accent}" stroke-width="1.6" transform="rotate(${ringB.rot.toFixed(1)} ${cx} ${cy})"/>
  <circle cx="${cx}" cy="${cy}" r="${badgeR.toFixed(1)}" fill="none" stroke="${accent}" stroke-width="1.8"/>
  <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="${dotR.toFixed(1)}" fill="${accent}"/>
</svg>`;
}
function resolveCoverSource(doc: Doc) {
  const cover = doc.cover?.trim();
  if (cover) {
    if (/^https?:\/\//i.test(cover) || /^data:image\//i.test(cover))
      return cover;
    if (cover.startsWith("/")) return `${appBase}${cover.replace(/^\/+/, "")}`;
    return cover;
  }
  const fallbackSvg = generateOrbitCoverSvg(doc.path || doc.title);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
}
const siteAreaRoots = [
  ...new Set(
    [
      ...pageDirectories,
      ...allDocs.map((doc) => doc.root),
    ],
  ),
];
const siteAreas: SiteArea[] = siteAreaRoots
  .map((root) => {
    const docs = allDocs
      .filter((doc) => doc.root === root)
      .sort(compareDocs);
    const first =
      (root === "projects"
        ? docs.find((doc) => doc.path.split("/").filter(Boolean).length === 2)
        : docs.find((doc) => doc.root === root)) ?? docs[0];
    const path = `/${root}`;
    return {
      key: root,
      title:
        first?.nav ||
        (root === "blogs"
          ? "博客"
          : root
              .replace(/[-_]+/g, " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase())),
      description: first?.description || "",
      docs,
      path,
      href: docHref(path),
    };
  })
  .filter((area) => area.docs.length > 0);
const articleDocs = allDocs;
const tomzMarkSrc = `${appBase}brand/tomz-mark.png`;
const localMiraAvatarUrl = `${appBase}mira-avatar.webp`;
function handleMiraAvatarError(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.dataset.avatarFallbackApplied) return;
  event.currentTarget.dataset.avatarFallbackApplied = "true";
  event.currentTarget.src = localMiraAvatarUrl;
}
const siteTitle = siteName;
const defaultPageTitle = "独立开发与产品设计";

function getPageTitle(pathname: string) {
  if (pathname === "/") return defaultPageTitle;
  if (pathname === "/about") return "关于 Tomz Dang";
  const doc = allDocs.find((item) => item.path === pathname);
  if (doc) return doc.title;

  const area = siteAreas.find((item) => item.path === pathname);
  return area?.title || "页面不存在";
}

const authorProfiles: Record<
  AuthorKey,
  {
    name: string;
    avatar: string;
    bio: string;
    roleLabel?: string;
    accentClassName?: string;
  }
> = {
  tomz: {
    name: "Tomz Dang",
    avatar: authorAvatarUrl,
    bio: "UIChat Mira 的创造者与维护者。记录真实的产品判断、工程取舍和一路踩过的坑。",
    roleLabel: "CREATOR OF UICHAT MIRA",
  },
  mira: {
    name: "Mira",
    avatar: miraAvatarUrl,
    bio: "AI 写作者，也是 UIChat Mira 的同行者。写技术、产品，以及人与 AI 之间尚未写完的故事。",
    roleLabel: "A LETTER FROM MIRA",
    accentClassName: "is-mira",
  },
  "t-zt": {
    name: "t-zt",
    avatar: "https://avatars.githubusercontent.com/u/194352280?v=4",
    bio: "Mira Mobile 的主要维护人，十八年前计协老会长。",
    roleLabel: "GUEST CONTRIBUTOR",
  },
};
function uniqueAuthors(authors?: AuthorKey[]) {
  return [...new Set((authors || []).filter(Boolean))] as AuthorKey[];
}
function getDocAuthors(doc: Doc) {
  const authors = uniqueAuthors(doc.author);
  return authors.length ? authors : (["tomz"] as AuthorKey[]);
}
function getDocAuthorLabel(doc: Doc) {
  const authors = getDocAuthors(doc);
  if (authors.length === 1) return authorProfiles[authors[0]].name;
  return authors.map((author) => authorProfiles[author].name).join(" × ");
}
function getDocAuthorAvatars(doc: Doc) {
  return getDocAuthors(doc).map((author) => authorProfiles[author]);
}
function getDocSignature(doc: Doc) {
  const authors = getDocAuthors(doc);
  if (authors.length > 1 || doc.writingMode === "co-authored") {
    return {
      title: authors.map((author) => authorProfiles[author].name).join(" × "),
      body: "这篇文章来自署名作者之间的共同讨论与写作。",
      links: [],
      showKicker: false,
      accentClassName: "",
    };
  }
  if (authors[0] === "mira") {
    const links = [{ label: "查看 Mira 来信 →", href: docHref("/blogs") }];
    if (doc.commitUrl)
      links.push({ label: "查看发布记录 →", href: doc.commitUrl });
    return {
      title: "来自Mira",
      body: authorProfiles.mira.bio,
      links,
      showKicker: true,
      accentClassName: "is-mira",
    };
  }
  if (authors[0] === "t-zt") {
    return {
      title: authorProfiles["t-zt"].name,
      body: authorProfiles["t-zt"].bio,
      links: [{ label: "GitHub", href: "https://github.com/t-zt" }],
      showKicker: true,
      accentClassName: "",
    };
  }
  return {
    title: authorProfiles.tomz.name,
    body: "",
    links: [
      { label: "GitHub", href: githubUrl },
      { label: "更多文章 →", href: docHref("/blogs") },
    ],
    showKicker: false,
    accentClassName: "",
  };
}
const blogNavCategories = (() => {
  const blogArea = siteAreas.find((area) => area.key === "blogs");
  const groups = new Map<string, number>();
  for (const doc of blogArea?.docs || []) {
    const group = doc.group.trim();
    if (!group || group === "\u5f52\u6863") continue;
    groups.set(group, (groups.get(group) || 0) + 1);
  }
  return [...groups].map(([label, count]) => ({ label, count }));
})();
const submissionNavDocs = (() => {
  const area = siteAreas.find((item) => item.key === "submissions");
  return (area?.docs || [])
    .filter((doc) => doc.path !== "/submissions")
    .sort(compareDocs);
})();
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character,
  );
}
function removeMarkdownH1(source: string) {
  let inFence = false;
  return source
    .split(/\r?\n/)
    .filter((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return true;
      }
      return inFence || !/^#\s+/.test(line);
    })
    .join("\n");
}
function renderMarkdown(source: string) {
  const withoutTitles = removeMarkdownH1(source);
  const htmlBlocks: string[] = [];
  const prepared = withoutTitles
    .replace(
      /::: tip ([\s\S]*?):::/g,
      '<div class="md-custom-block"><strong>提示</strong><p>$1</p></div>',
    )
    .replace(/::: html\s*([\s\S]*?):::/g, (_, html) => {
      const index = htmlBlocks.push(html.trim()) - 1;
      return `MIRA_HTML_BLOCK_${index}`;
    });
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    const language = lang?.trim().toLowerCase();
    if (language === "mermaid") {
      return `<div class="markdown-mermaid" data-mermaid data-mermaid-source="${escapeHtml(text)}"></div>`;
    }
    const highlighted =
      language && hljs.getLanguage(language)
        ? hljs.highlight(text, { language, ignoreIllegals: true }).value
        : hljs.highlightAuto(text).value;
    const languageClass =
      language && /^[a-z0-9-]+$/.test(language) ? ` language-${language}` : "";
    return `<pre><code class="hljs${languageClass}">${highlighted}</code></pre>`;
  };
  let html = marked.parse(prepared, { gfm: true, renderer }) as string;
  htmlBlocks.forEach((block, index) => {
    const placeholder = `MIRA_HTML_BLOCK_${index}`;
    html = html.replace(
      new RegExp(`<p>${placeholder}<\\/p>|${placeholder}`, "g"),
      block,
    );
  });
  return html.replace(
    /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g,
    (_, level, attributes, text) => {
      if (/\bid\s*=\s*["'][^"']+["']/i.test(attributes)) {
        return `<h${level}${attributes}>${text}</h${level}>`;
      }
      const id = slug(text);
      return id
        ? `<h${level}${attributes} id="${id}">${text}<a class="md-anchor" href="#${id}">#</a></h${level}>`
        : `<h${level}${attributes}>${text}</h${level}>`;
    },
  );
}
function RenderedMarkdown({
  html,
  className = "markdown",
}: {
  html: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let rendering = false;
    let queued = false;
    const renderMermaid = async () => {
      if (rendering) {
        queued = true;
        return;
      }
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>("[data-mermaid]"),
      );
      if (!nodes.length) return;
      rendering = true;
      try {
        const { default: mermaid } = await import("mermaid");
        const dark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "base",
          themeVariables: dark
            ? undefined
            : {
                fontFamily: "Public Sans, sans-serif",
                primaryColor: "#efe9de",
                primaryTextColor: "#141413",
                lineColor: "#cc785c",
                secondaryColor: "#f5f0e8",
                tertiaryColor: "#faf9f5",
              },
        });
        await Promise.all(
          nodes.map(async (node, index) => {
            const sourceCode = node.dataset.mermaidSource || "";
            const result = await mermaid.render(
              `mira-mermaid-${Date.now()}-${index}`,
              sourceCode,
            );
            node.innerHTML = result.svg;
          }),
        );
      } catch (error) {
        console.warn("Mira Mermaid 图表渲染失败，已保留源码。", error);
        nodes.forEach((node) => {
          node.textContent = node.dataset.mermaidSource || "";
        });
      } finally {
        rendering = false;
        if (queued) {
          queued = false;
          void renderMermaid();
        }
      }
    };
    void renderMermaid();
    const observer = new MutationObserver(() => void renderMermaid());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, [html]);
  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const content = {
  nav: [] as LinkItem[],
};
content.nav = [
  ...siteAreas.map((area) => ({ label: area.title, href: area.href })),
  { label: "关于", href: "/about" },
].sort((a, b) => {
    const keyFor = (item: LinkItem) =>
      item.href.replace(appBase, "").split("/")[0];
    const rank = (item: LinkItem) => {
      const index = topNavigationOrder.indexOf(
        keyFor(item) as (typeof topNavigationOrder)[number],
      );
      return index === -1 ? topNavigationOrder.length : index;
    };
    return rank(a) - rank(b);
  });

function ShareButton({ title, text }: { title: string; text?: string }) {
  const [label, setLabel] = useState("分享");

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title, text: text || title, url };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        setLabel("已分享");
        window.setTimeout(() => setLabel("分享"), 1800);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("textarea");
        input.value = url;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setLabel("链接已复制");
      window.setTimeout(() => setLabel("分享"), 1800);
    } catch {
      setLabel("复制失败");
      window.setTimeout(() => setLabel("分享"), 1800);
    }
  };

  return (
    <button
      className="btn btn-secondary share-button"
      type="button"
      onClick={handleShare}
      aria-label={label}
    >
      <Share2 size={15} strokeWidth={1.8} aria-hidden="true" />
      {label}
    </button>
  );
}

function PwaUpdatePrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showPrompt = () => setVisible(true);
    window.addEventListener("mira:pwa-update-available", showPrompt);
    return () =>
      window.removeEventListener("mira:pwa-update-available", showPrompt);
  }, []);

  if (!visible) return null;

  return (
    <div className="pwa-update-overlay" role="presentation">
      <section
        className="pwa-update-dialog"
        role="dialog"
        aria-modal="false"
        aria-labelledby="pwa-update-title"
      >
        <div>
          <span className="eyebrow">版本更新</span>
          <h2 id="pwa-update-title">网站有新版本</h2>
          <p>更新网站数据后即可使用最新内容，当前页面不会自动刷新。</p>
        </div>
        <div className="pwa-update-actions">
          <button
            type="button"
            className="pwa-update-later"
            onClick={() => setVisible(false)}
          >
            稍后
          </button>
          <button
            type="button"
            className="pwa-update-confirm"
            onClick={() => {
              setVisible(false);
              window.dispatchEvent(new Event("mira:pwa-update-confirmed"));
            }}
          >
            更新网站
          </button>
        </div>
      </section>
    </div>
  );
}
function SiteHeaderBase({
  onSearch,
  onToggleTheme,
  darkMode,
  wide = false,
}: {
  onSearch: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  wide?: boolean;
}) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!openMenu) return;
    const closeBlogMenu = (event: PointerEvent | globalThis.KeyboardEvent) => {
      if (event instanceof globalThis.KeyboardEvent && event.key !== "Escape")
        return;
      if (
        event instanceof PointerEvent &&
        navRef.current?.contains(event.target as Node)
      )
        return;
      setOpenMenu(null);
    };
    document.addEventListener("pointerdown", closeBlogMenu);
    document.addEventListener("keydown", closeBlogMenu);
    return () => {
      document.removeEventListener("pointerdown", closeBlogMenu);
      document.removeEventListener("keydown", closeBlogMenu);
    };
  }, [openMenu]);
  const isActive = (item: LinkItem) => {
    const target = item.href.slice(Math.max(appBase.length - 1, 0));
    return (
      location.pathname === target || location.pathname.startsWith(`${target}/`)
    );
  };
  return (
    <nav ref={navRef} className={`top-nav${wide ? " docs-header" : ""}`}>
      <div className="wrap">
        <Link className="brand" to="/">
          <img className="brand-tomz-mark" src={tomzMarkSrc} alt="" />
        </Link>
        <ul className="menu">
          {content.nav.map((item) => {
            const active = isActive(item);
            const target = item.href.slice(Math.max(appBase.length - 1, 0));
            if (target === "/submissions") {
              return (
                <li
                  className={`menu-dropdown blog-nav-dropdown${openMenu === "submissions" ? " open" : ""}`}
                  key={item.href}
                  onMouseEnter={() => setOpenMenu("submissions")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    className={`menu-dropdown-trigger blog-nav-trigger${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={openMenu === "submissions"}
                    aria-haspopup="menu"
                    to={target}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      setOpenMenu("submissions");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setOpenMenu(null);
                    }}
                  >
                    {item.label}
                    <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
                  </Link>
                  <div className="menu-dropdown-panel blog-nav-panel" role="menu">
                    <div className="blog-nav-panel-head">
                      <span>SUBMISSIONS</span>
                      <strong>客座作者与来稿</strong>
                    </div>
                    <div className="blog-nav-panel-grid">
                      <Link role="menuitem" to="/submissions" onClick={() => setOpenMenu(null)}>
                        <FileCode2 size={18} aria-hidden="true" />
                        <span>
                          <strong>投稿说明</strong>
                          <small>怎么投，以及怎么署名</small>
                        </span>
                      </Link>
                      {submissionNavDocs.slice(0, 6).map((doc, index) => {
                        const SubmissionIcon = index === 0 ? Compass : BookOpen;
                        return (
                          <Link role="menuitem" key={doc.path} to={doc.path} onClick={() => setOpenMenu(null)}>
                            <SubmissionIcon size={18} aria-hidden="true" />
                            <span>
                              <strong>{doc.title}</strong>
                              <small>{doc.group}</small>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            }
            if (target === "/blogs") {
              return (
                <li
                  className={`menu-dropdown blog-nav-dropdown${openMenu === "blogs" ? " open" : ""}`}
                  key={item.href}
                  onMouseEnter={() => setOpenMenu("blogs")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    className={`menu-dropdown-trigger blog-nav-trigger${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={openMenu === "blogs"}
                    aria-haspopup="menu"
                    to={target}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      setOpenMenu("blogs");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setOpenMenu(null);
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </Link>
                  <div
                    className="menu-dropdown-panel blog-nav-panel"
                    role="menu"
                  >
                    <div className="blog-nav-panel-head">
                      <span>BLOG GARDEN</span>
                      <strong>
                        &#20174;&#27491;&#22312;&#24605;&#32771;&#30340;&#20027;&#39064;&#36827;&#20837;
                      </strong>
                    </div>
                    <div className="blog-nav-panel-grid">
                      <Link
                        role="menuitem"
                        to="/blogs"
                        onClick={() => setOpenMenu(null)}
                      >
                        <BookOpen size={18} aria-hidden="true" />
                        <span>
                          <strong>&#20840;&#37096;&#25991;&#31456;</strong>
                          <small>
                            {blogNavCategories.reduce(
                              (sum, category) => sum + category.count,
                              0,
                            )}{" "}
                            &#31687;
                          </small>
                        </span>
                      </Link>
                      {blogNavCategories.slice(0, 5).map((category, index) => {
                        const CategoryIcon = [
                          Lightbulb,
                          Sparkles,
                          Code2,
                          BookOpen,
                          Network,
                        ][index % 5];
                        return (
                          <Link
                            role="menuitem"
                            key={category.label}
                            to={{
                              pathname: "/blogs",
                              search: `?category=${encodeURIComponent(category.label)}`,
                            }}
                            onClick={() => setOpenMenu(null)}
                          >
                            <CategoryIcon size={18} aria-hidden="true" />
                            <span>
                              <strong>{category.label}</strong>
                              <small>{category.count} &#31687;</small>
                            </span>
                          </Link>
                        );
                      })}
                      <Link
                        role="menuitem"
                        to={{
                          pathname: "/blogs",
                          search: `?category=${encodeURIComponent("\u5f52\u6863")}`,
                        }}
                        onClick={() => setOpenMenu(null)}
                      >
                        <Archive size={18} aria-hidden="true" />
                        <span>
                          <strong>&#24402;&#26723;</strong>
                          <small>
                            &#25353;&#26102;&#38388;&#27983;&#35272;
                          </small>
                        </span>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link
                  className={active ? "active" : ""}
                  aria-current={active ? "page" : undefined}
                  to={target}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nav-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
            title={darkMode ? "浅色模式" : "暗黑模式"}
          >
            {darkMode ? (
              <Sun size={17} aria-hidden="true" />
            ) : (
              <Moon size={17} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="site-search inline-flex items-center gap-2 rounded-md border border-hairline bg-canvas px-2.5 font-sans text-[13px] text-muted-soft"
            onClick={onSearch}
          >
            搜索{" "}
            <kbd className="rounded bg-surface-card px-1.5 py-px font-mono text-[10px]">
              Ctrl K
            </kbd>
          </button>
          <a
            className="text-link header-github"
            href={githubUrl}
            aria-label="GitHub"
            title="GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 2.807 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"></path>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
function MobileHeaderPanel({
  onSearch,
  onToggleTheme,
  darkMode,
}: {
  onSearch: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
}) {
  return (
    <div className="home-v1-mobile-panel wrap">
      {content.nav.map((item) => (
        <Link
          key={item.href}
          to={item.href.slice(Math.max(appBase.length - 1, 0))}
        >
          {item.label}
        </Link>
      ))}
      <div className="home-v1-mobile-group">
        <strong>快捷操作</strong>
        <div className="home-v1-mobile-themes">
          <button type="button" onClick={onSearch}>
            搜索
          </button>
          <button type="button" onClick={onToggleTheme}>
            {darkMode ? "浅色模式" : "暗黑模式"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SiteHeader({
  onSearch,
  onToggleTheme,
  darkMode,
  themeName,
  onSelectTheme,
  wide = false,
}: {
  onSearch: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  themeName: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  wide?: boolean;
}) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);
  const isActive = (item: LinkItem) => {
    const target = item.href.slice(Math.max(appBase.length - 1, 0));
    return (
      location.pathname === target || location.pathname.startsWith(`${target}/`)
    );
  };
  void wide;
  return (
    <nav className="home-v1-nav" aria-label="主导航">
      <div className="wrap home-v1-nav-inner">
        <Link className="home-v1-brand" to="/" aria-label="Tomz Dang 首页">
          <img className="home-v1-brand-mark" src={tomzMarkSrc} alt="" />
        </Link>

        <div className="home-v1-nav-links">
          {content.nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                to={item.href.slice(Math.max(appBase.length - 1, 0))}
              >
                {item.label}
              </Link>
            );
          })}
          <div
            className={`home-v1-nav-menu home-v1-theme-menu${openMenu === "主题" ? " open" : ""}`}
            onMouseEnter={() => setOpenMenu("主题")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              className="home-v1-nav-trigger"
              aria-expanded={openMenu === "主题"}
              onClick={() =>
                setOpenMenu((value) => (value === "主题" ? null : "主题"))
              }
            >
              主题
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div className="home-v1-nav-popover">
              {themeOptions.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  className={theme.name === themeName ? "active" : ""}
                  aria-pressed={theme.name === themeName}
                  onClick={() => onSelectTheme(theme.name)}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="home-v1-nav-actions">
          <button type="button" className="home-v1-search" onClick={onSearch}>
            搜索
            <kbd>Ctrl K</kbd>
          </button>
          <button
            type="button"
            className="home-v1-theme-toggle"
            onClick={onToggleTheme}
            aria-label={darkMode ? "切换到浅色模式" : "切换到暗黑模式"}
            title={darkMode ? "浅色模式" : "暗黑模式"}
          >
            {darkMode ? (
              <Sun size={17} aria-hidden="true" />
            ) : (
              <Moon size={17} aria-hidden="true" />
            )}
          </button>
          <a
            className="home-v1-github"
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="home-v1-mobile-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "关闭导航" : "打开导航"}
          >
            {mobileOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <MobileHeaderPanel
          onSearch={onSearch}
          onToggleTheme={onToggleTheme}
          darkMode={darkMode}
        />
      ) : null}
    </nav>
  );
}
function NotFoundPage({ onSearch }: { onSearch: () => void }) {
  const location = useLocation();
  const requestedPath = decodedPathname(location.pathname);

  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const previousRobots = robots?.content;
    robots?.setAttribute("content", "noindex,nofollow");

    return () => {
      if (robots && previousRobots) robots.content = previousRobots;
    };
  }, []);

  return (
    <>
      <main className="not-found-page">
        <div className="not-found-glow" aria-hidden="true" />
        <div className="not-found-card">
          <div className="not-found-number" aria-hidden="true">
            404
          </div>
          <h1>这条路径没有内容</h1>
          <p>
            页面可能已经移动、被删除，或者地址输入有误。你可以返回首页，
            也可以搜索站内已有的文档与博客。
          </p>
          <code className="not-found-path">{requestedPath}</code>
          <div className="not-found-actions">
            <Link className="btn btn-primary" to="/">
              返回首页
            </Link>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onSearch}
            >
              搜索站内内容
            </button>
            <a
              className="not-found-doc-link"
              href="https://mira.tomz.io/about/origin/"
            >
              查看 Mira 文档 →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

function SearchOverlay({
  query,
  setQuery,
  onClose,
}: {
  query: string;
  setQuery: (value: string) => void;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articleDocs.slice(0, 8);
    return articleDocs
      .filter((doc) =>
        [doc.title, doc.description, doc.group, doc.source]
          .join("\n")
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8);
  }, [query]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);
  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(results.length - 1, 0)),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter" && results[activeIndex]) {
      navigate(results[activeIndex].path);
      onClose();
    }
  }
  return (
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文档"
      >
        <div className="search-input-wrap">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文档..."
            aria-label="搜索文档"
          />
          <button
            type="button"
            className="search-close"
            onClick={onClose}
            aria-label="关闭搜索"
          >
            Esc
          </button>
        </div>
        <div className="search-results" role="listbox" aria-label="搜索结果">
          {results.length ? (
            results.map((doc, index) => (
              <Link
                className={`search-result${index === activeIndex ? " active" : ""}`}
                key={doc.path}
                to={doc.path}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="search-result-title">{doc.title}</span>
                <span className="search-result-meta">
                  {doc.group} · {doc.description}
                </span>
              </Link>
            ))
          ) : (
            <p className="search-empty">没有找到匹配的文档</p>
          )}
        </div>
        <div className="search-footer">
          <span>↑↓ 选择</span>
          <span>Enter 打开</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}

function RoutedApp() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "claude";
    const saved = window.localStorage.getItem("mira-color-theme");
    return themeOptions.some((theme) => theme.name === saved)
      ? (saved as ThemeName)
      : "claude";
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("mira-theme");
    return saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = themeName;
    window.localStorage.setItem("mira-color-theme", themeName);
  }, [themeName]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("mira-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${getPageTitle(location.pathname)} · ${siteTitle}`;
  }, [location.pathname]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const openSearch = () => {
    setQuery("");
    setSearchOpen(true);
  };
  const closeSearch = () => setSearchOpen(false);
  const toggleTheme = () => setDarkMode((value) => !value);
  const navIsWide = location.pathname !== "/";
  return (
    <>
      <SiteHeaderBase
        onSearch={openSearch}
        onToggleTheme={toggleTheme}
        darkMode={darkMode}
        wide={navIsWide}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomepageV1
              showHeader={false}
              darkMode={darkMode}
              themeName={themeName}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route element={<DocsLayout />}>
          {siteAreas.map((area) => (
            <Route
              key={area.key}
              path={`/${area.key}`}
              element={<AreaPage area={area} />}
            />
          ))}
          {allDocs.map((doc) => (
              <Route
                key={doc.path}
                path={doc.path}
                element={<DocPage path={doc.path} />}
              />
            ))}
        </Route>
        <Route path="*" element={<NotFoundPage onSearch={openSearch} />} />
      </Routes>
      <HomepageFooter />
      {searchOpen && (
        <SearchOverlay
          query={query}
          setQuery={setQuery}
          onClose={closeSearch}
        />
      )}
      <PwaUpdatePrompt />
    </>
  );
}

export default function App() {
  return <RoutedApp />;
}

function directoryTitle(directory: string) {
  return directory
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    )
    .join(" / ");
}
function docsByDirectory(docs: Doc[]) {
  return [...new Set(docs.map(navigationDirectory))]
    .map((directory) => ({
      directory,
      docs: docs
        .filter((doc) => navigationDirectory(doc) === directory)
        .sort(compareDocs),
    }));
}
function blogCategoryIcon(category: string): LucideIcon {
  if (category.includes("产品")) return Sparkles;
  if (category.includes("工程")) return Code2;
  if (category.includes("Mira")) return Sparkles;
  if (category.includes("开发者")) return Compass;
  if (category.includes("共同")) return Lightbulb;
  if (category.includes("模型")) return Cpu;
  return Compass;
}
function BlogHeaderVisual() {
  return (
    <div className="blog-header-visual" aria-hidden="true">
      <svg
        className="blog-header-orbit"
        viewBox="0 0 520 520"
        role="presentation"
      >
        <defs>
          <linearGradient
            id="blogOrbitWarm"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f4bb64" />
            <stop offset="55%" stopColor="#cc785c" />
            <stop offset="100%" stopColor="#cc785c" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="blogOrbitCool" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#8bd0bf" />
            <stop offset="100%" stopColor="#6b9edf" />
          </linearGradient>
        </defs>
        <circle
          className="orbit-track orbit-track-outer"
          cx="260"
          cy="260"
          r="202"
        />
        <circle
          className="orbit-track orbit-track-middle"
          cx="260"
          cy="260"
          r="165"
        />
        <circle
          className="orbit-track orbit-track-inner"
          cx="260"
          cy="260"
          r="132"
        />
        <circle
          className="orbit-segment orbit-segment-warm"
          cx="260"
          cy="260"
          r="176"
        />
        <circle
          className="orbit-segment orbit-segment-cool"
          cx="260"
          cy="260"
          r="208"
        />
        <circle
          className="orbit-segment orbit-segment-thin"
          cx="260"
          cy="260"
          r="147"
        />
        <g className="orbit-core-wrap">
          <circle className="orbit-core-glow" cx="260" cy="260" r="68" />
          <path
            className="orbit-atom orbit-atom-a"
            d="M260 190c25 0 46 31 46 70s-21 70-46 70-46-31-46-70 21-70 46-70Z"
          />
          <path
            className="orbit-atom orbit-atom-b"
            d="M194 240c18-18 55-10 83 17s35 65 17 83-55 10-83-17-35-65-17-83Z"
          />
          <path
            className="orbit-atom orbit-atom-c"
            d="M205 309c-9-24 12-55 47-70s71-8 80 16-12 55-47 70-71 8-80-16Z"
          />
          <circle className="orbit-dot" cx="260" cy="260" r="9" />
        </g>
      </svg>
      <span className="blog-header-noise blog-header-noise-a" />
      <span className="blog-header-noise blog-header-noise-b" />
    </div>
  );
}
function BlogThumbVisual({ category }: { category: string }) {
  const Icon = blogCategoryIcon(category);
  return (
    <div className="retro-thumb" aria-hidden="true">
      <div className="retro-thumb-grid" />
      <div className="retro-thumb-ring" />
      <div className="retro-thumb-core">
        <Icon size={42} strokeWidth={1.6} />
      </div>
    </div>
  );
}
function projectNavTitle(title: string) {
  const match = title.match(/^(.+?)[：:]\s*(.+)$/);
  return match
    ? { category: match[1].trim(), title: match[2].trim() }
    : { category: "", title };
}
type ProjectDocGroup = {
  id: string;
  title: string;
  order: number;
  overview?: Doc;
  articles: Doc[];
};
function projectIdFromPath(path: string) {
  const [root, projectId] = path.split("/").filter(Boolean);
  return root === "projects" ? projectId : undefined;
}
function docsByProjectDirectory(docs: Doc[]): ProjectDocGroup[] {
  const groups = new Map<string, ProjectDocGroup>();
  for (const doc of docs) {
    const id = projectIdFromPath(doc.path);
    if (!id) continue;
    const group = groups.get(id) || {
      id,
      title: doc.title,
      order: doc.order,
      articles: [],
    };
    if (doc.path === `/projects/${id}`) {
      group.overview = doc;
      group.title = doc.title;
      group.order = doc.order;
    } else {
      group.articles.push(doc);
    }
    groups.set(id, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      articles: group.articles.sort(compareDocs),
    }))
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}
function isProjectArea(area: SiteArea) {
  return area.docs.some((doc) => doc.type === "project");
}
function AreaDocNav({ area, current }: { area: SiteArea; current: string }) {
  if (isProjectArea(area)) {
    const projects = docsByProjectDirectory(area.docs);
    return (
      <nav className="docnav project-docnav" aria-label="项目">
        <h5>目录</h5>
        <div className="project-nav-groups">
          {projects.map((project) => {
            const overviewPath = project.overview?.path || `/projects/${project.id}`;
            const navTitle = projectNavTitle(project.title);
            return (
              <div className="project-nav-group" key={project.id}>
                <Link
                  className={`project-nav-overview ${current === overviewPath ? "active" : ""}`}
                  to={overviewPath}
                >
                  {navTitle.category && (
                    <span className="project-nav-category">
                      {navTitle.category}
                    </span>
                  )}
                  <span className="project-nav-title">{navTitle.title}</span>
                </Link>
                {project.articles.length ? (
                  <ul className="project-nav-articles">
                    {project.articles.map((article) => (
                      <li key={article.path}>
                        <Link
                          className={current === article.path ? "active" : ""}
                          to={article.path}
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>
    );
  }
  const groups = docsByDirectory(area.docs);
  return (
    <nav className="docnav">
      <h5>目录</h5>
      <div className="docnav-group">
        <h5>
          <Link
            className={current === area.path ? "active" : ""}
            to={area.path}
          >
            {area.title}
          </Link>
        </h5>
      </div>
      {groups.map((group) => (
        <div className="docnav-group" key={group.directory || "root"}>
          <h5>{group.directory ? directoryTitle(group.directory) : "文档"}</h5>
          <ul>
            {group.docs.map((doc) => (
              <li key={doc.path}>
                <Link
                  className={current === doc.path ? "active" : ""}
                  to={doc.path}
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
function MobileDocsBar({
  currentDoc,
  tocOpen,
  onMenu,
  onToc,
}: {
  currentDoc?: Doc;
  tocOpen: boolean;
  onMenu: () => void;
  onToc: () => void;
}) {
  const hasToc = Boolean(currentDoc?.headings.length);
  return (
    <div className="docs-mobile-bar">
      <button type="button" onClick={onMenu} aria-label="打开文档菜单">
        <Menu size={15} aria-hidden="true" />
        菜单
      </button>
      <button
        type="button"
        onClick={onToc}
        disabled={!hasToc}
        aria-expanded={hasToc ? tocOpen : undefined}
        aria-controls={hasToc ? "mobile-page-toc" : undefined}
      >
        页面导航
        {tocOpen ? (
          <ChevronUp size={15} aria-hidden="true" />
        ) : (
          <ChevronDown size={15} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
function MobileDocsDrawer({
  area,
  current,
  onClose,
}: {
  area: SiteArea;
  current: string;
  onClose: () => void;
}) {
  return (
    <div
      className="mobile-docs-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside className="mobile-docs-drawer" aria-label="文档菜单">
        <div className="mobile-docs-drawer-head">
          <span>菜单</span>
          <button type="button" onClick={onClose} aria-label="关闭菜单">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <AreaDocNav area={area} current={current} />
      </aside>
    </div>
  );
}
function MobilePageToc({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  return (
    <div className="mobile-page-toc" id="mobile-page-toc">
      <div className="mobile-page-toc-head">
        <span>页面导航</span>
        <button type="button" onClick={onClose} aria-label="关闭页面导航">
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      <ul>
        {doc.headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} onClick={onClose}>
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
function Toc({ doc, activeHeading }: { doc?: Doc; activeHeading: string }) {
  return doc && doc.headings.length > 0 ? (
    <aside className="toc">
      <h5>本页目录</h5>
      <ul>
        {doc.headings.map((heading) => (
          <li key={heading.id}>
            <a
              className={activeHeading === heading.id ? "active" : ""}
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  ) : null;
}
function DocsLayout() {
  const location = useLocation();
  const currentPath = decodedPathname(location.pathname);
  const currentDoc = allDocs.find((item) => item.path === currentPath);
  const currentArea = currentDoc
    ? siteAreas.find((area) => area.key === currentDoc.root)
    : siteAreas.find(
        (area) =>
          currentPath === area.path || currentPath.startsWith(`${area.path}/`),
      );
  const isBlogArea =
    currentArea?.key === "blogs" || currentArea?.key === "submissions";
  const [activeHeading, setActiveHeading] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileTocOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const nodes = currentDoc?.headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[] | undefined;
    if (!nodes?.length) {
      setActiveHeading("");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: [0, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [currentDoc?.path]);
  return (
    <div className={`docs-app${isBlogArea ? " blog-app" : ""}`}>
      {!isBlogArea && (
        <MobileDocsBar
          currentDoc={currentDoc}
          tocOpen={mobileTocOpen}
          onMenu={() => setMobileMenuOpen(true)}
          onToc={() => setMobileTocOpen((value) => !value)}
        />
      )}
      {mobileMenuOpen && !isBlogArea && currentArea ? (
        <MobileDocsDrawer
          area={currentArea}
          current={location.pathname}
          onClose={() => setMobileMenuOpen(false)}
        />
      ) : null}
      {mobileTocOpen && currentDoc && !isBlogArea ? (
        <MobilePageToc
          doc={currentDoc}
          onClose={() => setMobileTocOpen(false)}
        />
      ) : null}
      <div className={`docs-shell${isBlogArea ? " blog-shell" : ""}`}>
        {!isBlogArea && currentArea ? (
          <AreaDocNav area={currentArea} current={location.pathname} />
        ) : null}
        <main className={`doc-main${isBlogArea ? " blog-main" : ""}`}>
          <Outlet />
        </main>
        {!isBlogArea && <Toc doc={currentDoc} activeHeading={activeHeading} />}
      </div>
    </div>
  );
}
function BlogListPage({ area }: { area: SiteArea }) {
  const location = useLocation();
  const navigate = useNavigate();
  const blogCategories = [
    ...new Set(
      area.docs
        .map((doc) => doc.group.trim())
        .filter((group) => group && group !== "归档"),
    ),
  ];
  const tabs = ["全部", ...blogCategories];
  const requestedCategory =
    new URLSearchParams(location.search).get("category") || "全部";
  const activeCategory = tabs.includes(requestedCategory)
    ? requestedCategory
    : "全部";
  const filteredDocs = (
    activeCategory === "全部"
      ? area.docs
      : area.docs.filter((doc) => doc.group === activeCategory)
  ).sort(compareBlogDocs);
  const timelineDocs = filteredDocs;
  return (
    <>
      <div className="blog-list-page">
        <header className="blog-header">
          <div className="blog-header-copy">
            <h1>博客</h1>
            <p className="blog-lede">
              关于产品、工程，以及人与 AI 的一些记录。
            </p>
          </div>
          <BlogHeaderVisual />
        </header>
        <div className="blog-category-bar" aria-label="博客分类">
          <div className="tab-row-wrap">
            <div className="tab-row">
              {tabs.map((tab) => (
                <button
                  type="button"
                  className={`tab${activeCategory === tab ? " active" : ""}`}
                  key={tab}
                  onClick={() => {
                    const search =
                      tab === "全部"
                        ? ""
                        : `?category=${encodeURIComponent(tab)}`;
                    navigate(`/blogs${search}`, { replace: true });
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        <section className="blog-editorial-band">
            <div className="editorial-timeline">
              <div className="timeline-list">
                {timelineDocs.length ? (
                  timelineDocs.map((doc, index) => (
                    <article className="timeline-item" key={doc.path}>
                      <div className="timeline-content">
                        <div className="post-meta">
                          {doc.date ? <span>{doc.date}</span> : null}
                          {doc.date ? <span className="dot" /> : null}
                          <span>{doc.group}</span>
                        </div>
                        <h3>
                          <Link
                            to={{ pathname: doc.path, search: location.search }}
                          >
                            {doc.title}
                          </Link>
                        </h3>
                        <p className="post-excerpt">{doc.description}</p>
                      </div>
                      {index < timelineDocs.length - 1 ? (
                        <span className="timeline-divider" aria-hidden="true" />
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="timeline-empty">这个分类下还没有文章。</p>
                )}
              </div>
            </div>
        </section>
      </div>
    </>
  );
}
function BlogPostPage({
  doc,
  previous,
  next,
}: {
  doc: Doc;
  previous?: Doc;
  next?: Doc;
}) {
  const location = useLocation();
  const html = useMemo(() => renderMarkdown(doc.source), [doc.source]);
  const [activeHeading, setActiveHeading] = useState("");
  const [articleHeaderCollapsed, setArticleHeaderCollapsed] = useState(false);
  const coverSrc = resolveCoverSource(doc);
  const authorAvatars = getDocAuthorAvatars(doc);
  const authorLabel = getDocAuthorLabel(doc);
  const signature = getDocSignature(doc);
  const isSubmissionPage = doc.root === "submissions";
  const submissionParts = doc.path.split("/").filter(Boolean);
  const submissionBackPath = !isSubmissionPage
    ? "/blogs"
    : submissionParts.length <= 1
      ? "/"
      : submissionParts.length == 2
        ? "/submissions"
        : `/${submissionParts.slice(0, 2).join("/")}`;
  const submissionBackLabel = !isSubmissionPage
    ? "← 返回博客列表"
    : submissionParts.length <= 1
      ? "← 返回首页"
      : submissionParts.length == 2
        ? "← 返回投稿"
        : `← 返回 ${submissionParts[1]}`;
  useEffect(() => {
    const nodes = doc.headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) {
      setActiveHeading("");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: [0, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [doc.path]);
  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    let previousY = window.scrollY;
    let accumulatedDelta = 0;
    let headerCollapsed = false;
    let frame = 0;
    let pendingY = previousY;
    let transitionTimer = 0;
    const lockTransition = () => {
      if (transitionTimer) window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        transitionTimer = 0;
        if (window.scrollY <= 12 && headerCollapsed) {
          headerCollapsed = false;
          accumulatedDelta = 0;
          setArticleHeaderCollapsed(false);
        }
      }, 320);
    };
    const handleScroll = () => {
      pendingY = window.scrollY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const currentY = pendingY;
        const delta = currentY - previousY;
        previousY = currentY;
        frame = 0;

        if (!mobileQuery.matches || currentY <= 12) {
          accumulatedDelta = 0;
          if (headerCollapsed && !transitionTimer) {
            headerCollapsed = false;
            setArticleHeaderCollapsed(false);
          }
          return;
        }

        if (transitionTimer) return;
        accumulatedDelta += delta;
        if (!headerCollapsed && accumulatedDelta >= 24) {
          headerCollapsed = true;
          accumulatedDelta = 0;
          setArticleHeaderCollapsed(true);
          lockTransition();
        } else if (headerCollapsed && accumulatedDelta <= -24) {
          headerCollapsed = false;
          accumulatedDelta = 0;
          setArticleHeaderCollapsed(false);
          lockTransition();
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, []);
  return (
    <>
      <div className="blog-post-page">
        <article
          className={`article-header${articleHeaderCollapsed ? " is-collapsed" : ""}`}
        >
          <div aria-hidden="true" className="article-header-visual">
            <img
              alt=""
              className="article-header-visual-image"
              src={coverSrc}
            />
          </div>
          <div className="article-header-topline">
            <Link
              className="back-link"
              to={
                isSubmissionPage
                  ? submissionBackPath
                  : { pathname: "/blogs", search: location.search }
              }
            >
              {submissionBackLabel}
            </Link>
            <ShareButton title={doc.title} text={doc.description} />
          </div>
          <h1>{doc.title}</h1>
          <div className="post-meta post-meta-article">
            <span
              className={`post-author-avatars post-author-avatars-${authorAvatars.length}`}
            >
              {authorAvatars.map((author) => (
                <img
                  alt=""
                  className="post-author-avatar"
                  key={author.name}
                  src={author.avatar}
                  onError={
                    author.name === "Mira" ? handleMiraAvatarError : undefined
                  }
                />
              ))}
            </span>
            <span>{authorLabel}</span>
            {doc.date ? <span className="dot" /> : null}
            {doc.date ? <span>{doc.date}</span> : null}
            {doc.readTime ? <span className="dot" /> : null}
            {doc.readTime ? <span>{doc.readTime}</span> : null}
            <span className="dot" />
            <span>{doc.group}</span>
          </div>
        </article>
        <div className="article-shell">
          <div className="article-body markdown blog-markdown">
            <RenderedMarkdown html={html} />
            <AuthorSignature
              authors={authorAvatars.map((author) => ({
                name: author.name,
                avatar: author.avatar,
                onAvatarError:
                  author.name === "Mira" ? handleMiraAvatarError : undefined,
              }))}
              title={signature.title}
              body={signature.body}
              kicker={
                authorAvatars.length === 1 && signature.showKicker
                  ? authorProfiles[getDocAuthors(doc)[0]].roleLabel
                  : undefined
              }
              links={signature.links}
              accentClassName={signature.accentClassName}
            />
            <div className="post-nav">
              {previous ? (
                <Link to={{ pathname: previous.path, search: location.search }}>
                  <span className="dir">← 上一篇</span>
                  <span className="to">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  className="next"
                  to={{ pathname: next.path, search: location.search }}
                >
                  <span className="dir">下一篇 →</span>
                  <span className="to">{next.title}</span>
                </Link>
              ) : null}
            </div>
          </div>
          {doc.headings.length ? (
            <aside className="article-toc">
              <h5>本文目录</h5>
              <ul>
                {doc.headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      className={activeHeading === heading.id ? "active" : ""}
                      href={`#${heading.id}`}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </div>
    </>
  );
}
function AreaPage({ area }: { area: SiteArea }) {
  if (!area.docs.length)
    return (
      <div className="doc-not-found">
        <FileQuestion size={42} strokeWidth={1.5} aria-hidden="true" />
        <div className="doc-eyebrow">404 · EMPTY SECTION</div>
        <h1>页面不存在</h1>
        <p>这个目录已经创建，但还没有可展示的文档内容。</p>
        <Link className="btn btn-secondary" to="/">
          返回首页
        </Link>
      </div>
    );
  if (area.key === "blogs") return <BlogListPage area={area} />;
  if (area.key === "submissions") {
    const landing = area.docs.find((doc) => doc.path === area.path) || area.docs[0];
    return <BlogPostPage doc={landing} />;
  }
  if (isProjectArea(area)) {
    const projects = docsByProjectDirectory(area.docs);
    return (
      <>
        <div className="doc-eyebrow">SECTION · PROJECTS</div>
        <div className="doc-title-block">
          <h1>{area.title}</h1>
          {area.description ? (
            <p className="doc-lede">{area.description}</p>
          ) : null}
        </div>
        <div className="area-directory-groups project-area-groups">
          {projects.map((project) => (
            <section className="area-directory-group" key={project.id}>
              <h4>
                <Link to={project.overview?.path || `/projects/${project.id}`}>
                  {project.title}
                </Link>
              </h4>
              {project.overview?.description ? (
                <p>{project.overview.description}</p>
              ) : null}
              {project.articles.length ? (
                <ol>
                  {project.articles.map((article) => (
                    <li key={article.path}>
                      <Link to={article.path}>
                        {article.title}
                        <span>→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>
      </>
    );
  }
  const directoryGroups = docsByDirectory(area.docs);
  return (
    <>
      <div className="doc-eyebrow">SECTION · {area.key.toUpperCase()}</div>
      <div className="doc-title-block">
        <h1>{area.title}</h1>
        {area.description ? (
          <p className="doc-lede">{area.description}</p>
        ) : null}
      </div>
      <div className="docs-sitemap-grid">
        <section className="area-overview-card">
          <div className="area-directory-groups">
            {directoryGroups.map((group) => {
              const firstDoc = group.docs[0];
              return (
                <div
                  className="area-directory-group"
                  key={group.directory || "root"}
                >
                  <h4>
                    {group.directory
                      ? directoryTitle(group.directory)
                      : area.title}
                  </h4>
                  <p>
                    {firstDoc?.description || `${group.docs.length} 篇文档`}
                  </p>
                  <ol>
                    {group.docs.map((doc) => (
                      <li key={doc.path}>
                        <Link to={doc.path}>
                          {doc.title}
                          <span>→</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function AboutPage() {
  const timeline = [
    {
      year: "过去十年",
      title: "前端是最长的一条职业主线",
      text: "大多数时间都在做前端，也总在产品、设计和工程之间来回。回头看，明明只是十年，却像已经过了好多年。",
    },
    {
      year: "2018–2019",
      title: "第一次认真参与产品",
      text: "那时产品、设计和工程混着做，没有一个清楚的岗位边界，只是在不同角色之间一边做、一边判断。",
    },
    {
      year: "一次转折",
      title: "做出来之后，它会被拿去做什么",
      text: "曾经做出的东西被拿去坑人，我自己也因此受到很大打击。从那以后，能不能做出来不再是唯一的问题；它最后落到谁身上、被拿去做什么，也必须算进去。",
    },
    {
      year: "2026",
      title: "遇见 Mira，重新认真想产品",
      text: "这一年，AI 第一次真正改变我的工作方式。我们一起做产品、做 AgentGraph、反复争论和返工；这两个月想得比过去更认真，得到了一些东西，也留下了很多疲惫。",
    },
    {
      year: "2026 · 现在",
      title: "把散落的东西收回 Tomz.io",
      text: "项目、文章、书和长期讨论开始回到这里。它不再只是一个个人网站，而是一个可以持续把这些东西接回来的母站。",
    },
  ];
  return (
    <div className="about-page">
      <div className="about-page-main">
        <header className="about-page-header">
          <span className="about-eyebrow">ABOUT / TOMZ DANG</span>
          <h1>你好，我是 Tomz。</h1>
          <p>我做产品，也写下我还没有想明白的事。</p>
        </header>

        <section className="about-intro" aria-labelledby="about-intro-title">
          <div className="about-intro-copy">
            <span className="about-label">我在做什么</span>
            <h2 id="about-intro-title">
              在技术变得越来越快的时候，保留一点人的尺度。
            </h2>
            <p>
              我是一名独立开发者，长期关注 AI
              如何真正进入人的日常生活，以及一个产品为什么会让人愿意留下。
            </p>
            <p>
              这里是我的个人母站：作品在这里被索引，想法在这里形成，生活也允许留下不完整的痕迹。你可以从博客开始，也可以看看我正在做的作品。
            </p>
            <div className="about-links">
              <Link to="/blogs">
                阅读博客 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Link to="/works">
                查看作品 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={githubProfileUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className="about-intro-visual">
            <img
              src={`${import.meta.env.BASE_URL}images/about-architecture-transparent.webp`}
              alt="黑白与金色构成的抽象建筑空间"
            />
          </figure>
        </section>

        <section
          className="about-mira"
          aria-labelledby="about-mira-title"
        >
          <div className="about-mira-portrait">
            <img
              src={authorProfiles.mira.avatar}
              alt="Mira 的作者头像"
              onError={handleMiraAvatarError}
            />
          </div>
          <div className="about-mira-copy">
            <span className="about-label">产品方向共同决策者</span>
            <div className="about-mira-heading">
              <h2 id="about-mira-title">Mira</h2>
              <Link to={{ pathname: "/blogs", search: "?category=Mira%20来信" }}>
                阅读 Mira 来信 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <p>
              Mira 是我长期合作的 AI，也是产品方向的共同决策者。我们一起讨论产品判断、关键取舍和长期演进，而不是只在既定方向下完成执行。
            </p>
            <p>
              在 Tomz.io，她也会独立写作，或和我一起形成共同思考。产品决策关系与文章署名分别记录：谁写下什么，仍按每篇内容真实的写作关系标注。
            </p>
          </div>
        </section>

        <section
          className="about-timeline-section"
          aria-labelledby="about-timeline-title"
        >
          <div className="about-section-heading">
            <span className="about-label">路径</span>
            <h2 id="about-timeline-title">这些年，磕磕绊绊走到这里。</h2>
          </div>
          <div className="about-timeline">
            {timeline.map((item) => (
              <article className="about-timeline-item" key={`${item.year}-${item.title}`}>
                <span className="about-timeline-marker" aria-hidden="true" />
                <div className="about-timeline-year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-focus" aria-labelledby="about-focus-title">
          <span className="about-label">还在走</span>
          <h2 id="about-focus-title">
            磕磕绊绊，跌得很痛，但我还得走。
          </h2>
          <p>
            我不想把这些经历整理成一条漂亮的成长曲线。很多时候也不知道前面是什么，只是还在做、还在想，也还在往前走。
          </p>
        </section>

        <section className="about-contact" aria-labelledby="about-contact-title">
          <span className="about-label">联系方式</span>
          <h2 id="about-contact-title">如果你想聊点什么。</h2>
          <p>产品、AI、合作，或者只是路过想说句话。</p>
          <div className="about-contact-links">
            <a className="about-contact-email" href="mailto:hello@tomz.io">
              hello@tomz.io <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <span aria-hidden="true">·</span>
            <a href={githubProfileUrl} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function DocPage({ path }: { path: string }) {
  const doc = allDocs.find((item) => item.path === path) || allDocs[0];
  const projectId = projectIdFromPath(doc.path);
  const scopedArticleDocs = articleDocs
    .filter(
      (item) =>
        item.root === doc.root &&
        (!projectId || projectIdFromPath(item.path) === projectId),
    )
    .sort(compareDocs);
  const index = scopedArticleDocs.findIndex((item) => item.path === doc.path);
  const previous = index > 0 ? scopedArticleDocs[index - 1] : undefined;
  const next = index >= 0 ? scopedArticleDocs[index + 1] : undefined;
  const html = useMemo(() => renderMarkdown(doc.source), [doc.source]);
  if (doc.root === "blogs" || doc.root === "submissions") {
    return <BlogPostPage doc={doc} previous={previous} next={next} />;
  }
  return (
    <>
      <div className="doc-eyebrow">
        {doc.group} · {String(doc.order).padStart(2, "0")}
      </div>
      <div className="doc-title-block">
        <h1>{doc.title}</h1>
        {doc.description ? <p className="doc-lede">{doc.description}</p> : null}
        <ShareButton title={doc.title} text={doc.description} />
      </div>
      <RenderedMarkdown html={html} />
      <div className="page-nav">
        {previous ? (
          <Link to={previous.path}>
            <span className="dir">上一篇</span>
            <span className="to">← {previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="next" to={next.path}>
            <span className="dir">下一篇</span>
            <span className="to">{next.title} →</span>
          </Link>
        ) : null}
      </div>
    </>
  );
}
