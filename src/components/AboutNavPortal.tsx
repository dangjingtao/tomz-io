import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

type NavTarget = {
  element: Element;
  kind: "top" | "mobile";
};

function sameTargets(left: NavTarget[], right: NavTarget[]) {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.element === right[index]?.element && item.kind === right[index]?.kind,
    )
  );
}

function collectTargets(): NavTarget[] {
  const targets: NavTarget[] = [];

  document
    .querySelectorAll<HTMLAnchorElement>('.top-nav .menu > li > a[href$="/about"]')
    .forEach((trigger) => {
      if (trigger.parentElement) {
        targets.push({ element: trigger.parentElement, kind: "top" });
      }
    });

  document.querySelectorAll(".home-v1-mobile-panel").forEach((element) => {
    if (element.querySelector(':scope > a[href$="/about"]')) {
      targets.push({ element, kind: "mobile" });
    }
  });

  return targets;
}

function DesktopAboutMenu({ host }: { host: Element }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const item = host as HTMLElement;
    const trigger = item.querySelector<HTMLAnchorElement>(
      ':scope > a[href$="/about"]',
    );
    if (!trigger) return;

    item.classList.add("menu-dropdown", "blog-nav-dropdown", "about-nav-dropdown");
    trigger.classList.add("menu-dropdown-trigger", "blog-nav-trigger");
    trigger.setAttribute("aria-haspopup", "menu");

    const handleEnter = () => setOpen(true);
    const handleLeave = () => setOpen(false);
    const handleClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setOpen(true);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!item.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.focus();
    };

    item.addEventListener("mouseenter", handleEnter);
    item.addEventListener("mouseleave", handleLeave);
    trigger.addEventListener("click", handleClick);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      item.classList.remove(
        "menu-dropdown",
        "blog-nav-dropdown",
        "about-nav-dropdown",
        "open",
      );
      trigger.classList.remove("menu-dropdown-trigger", "blog-nav-trigger");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
      item.removeEventListener("mouseenter", handleEnter);
      item.removeEventListener("mouseleave", handleLeave);
      trigger.removeEventListener("click", handleClick);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [host]);

  useEffect(() => {
    const item = host as HTMLElement;
    const trigger = item.querySelector<HTMLAnchorElement>(
      ':scope > a[href$="/about"]',
    );
    item.classList.toggle("open", open);
    trigger?.setAttribute("aria-expanded", String(open));
  }, [host, open]);

  return (
    <div className="menu-dropdown-panel blog-nav-panel" role="menu">
      <div className="blog-nav-panel-head">
        <span>ABOUT TOMZ.IO</span>
        <strong>关于与参与</strong>
      </div>
      <div className="blog-nav-panel-grid">
        <Link role="menuitem" to="/about" onClick={() => setOpen(false)}>
          <span>
            <strong>关于 Tomz.io</strong>
            <small>Tomz、Mira 与这个站点</small>
          </span>
        </Link>
        <Link role="menuitem" to="/submissions" onClick={() => setOpen(false)}>
          <span>
            <strong>参与 Tomz.io</strong>
            <small>投稿方式、署名与编辑规则</small>
          </span>
        </Link>
        <Link
          role="menuitem"
          to="/submissions/contributors"
          onClick={() => setOpen(false)}
        >
          <span>
            <strong>客座作者</strong>
            <small>集中查看作者介绍与已发布文章</small>
          </span>
        </Link>
      </div>
    </div>
  );
}

function MobileAboutLinks() {
  return (
    <div className="about-mobile-secondary" aria-label="关于 Tomz.io 的更多入口">
      <strong>关于 · 更多</strong>
      <Link to="/submissions">参与 Tomz.io</Link>
      <Link to="/submissions/contributors">客座作者</Link>
    </div>
  );
}

export default function AboutNavPortal() {
  const location = useLocation();
  const [targets, setTargets] = useState<NavTarget[]>([]);

  useEffect(() => {
    let frame = 0;
    const syncTargets = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const next = collectTargets();
        setTargets((current) => (sameTargets(current, next) ? current : next));
      });
    };

    syncTargets();

    const observer = new MutationObserver(syncTargets);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

  return (
    <>
      {targets.map((target, index) =>
        createPortal(
          target.kind === "mobile" ? (
            <MobileAboutLinks />
          ) : (
            <DesktopAboutMenu host={target.element} />
          ),
          target.element,
          `${target.kind}-${index}`,
        ),
      )}
    </>
  );
}
