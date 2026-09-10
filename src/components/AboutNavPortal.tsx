import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

type NavTarget = {
  element: Element;
  kind: "top" | "home" | "mobile";
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

  document.querySelectorAll(".top-nav .menu").forEach((element) => {
    if (element.querySelector(':scope > li > a[href$="/about"]')) {
      targets.push({ element, kind: "top" });
    }
  });

  document.querySelectorAll(".home-v1-nav-links").forEach((element) => {
    if (element.querySelector(':scope > a[href$="/about"]')) {
      targets.push({ element, kind: "home" });
    }
  });

  document.querySelectorAll(".home-v1-mobile-panel").forEach((element) => {
    if (element.querySelector(':scope > a[href$="/about"]')) {
      targets.push({ element, kind: "mobile" });
    }
  });

  return targets;
}

function DesktopAboutMenu({ kind }: { kind: "top" | "home" }) {
  return (
    <div
      className={`about-secondary-menu about-secondary-menu-${kind}`}
      aria-label="关于 Tomz.io"
    >
      <p>ABOUT TOMZ.IO</p>
      <Link to="/submissions">
        <strong>参与 Tomz.io</strong>
        <span>投稿方式、署名与编辑规则</span>
      </Link>
      <Link to="/submissions/contributors">
        <strong>客座作者</strong>
        <span>集中查看作者介绍与已发布文章</span>
      </Link>
    </div>
  );
}

function MobileAboutLinks() {
  return (
    <div className="about-mobile-secondary" aria-label="关于 Tomz.io 的更多入口">
      <span>更多</span>
      <Link to="/submissions">参与 Tomz.io</Link>
      <Link to="/submissions/contributors">客座作者</Link>
    </div>
  );
}

export default function AboutNavPortal() {
  const location = useLocation();
  const [targets, setTargets] = useState<NavTarget[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const next = collectTargets();
      setTargets((current) => (sameTargets(current, next) ? current : next));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <>
      {targets.map((target, index) =>
        createPortal(
          target.kind === "mobile" ? (
            <MobileAboutLinks />
          ) : (
            <DesktopAboutMenu kind={target.kind} />
          ),
          target.element,
          `${target.kind}-${index}`,
        ),
      )}
    </>
  );
}
