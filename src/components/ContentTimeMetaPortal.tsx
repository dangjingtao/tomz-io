import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { formatContentTime } from "../content/content-time";
import { allDocs, type Doc } from "../content/mira-docs-adapter";

function decodedPathname(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function targetSelector(doc: Doc): string {
  if (doc.root === "blogs") return ".post-meta.post-meta-article";
  if (doc.root === "books") return ".book-reader-meta";
  return ".doc-title-block";
}

function hideLegacyDate(target: HTMLElement, doc: Doc): HTMLElement[] {
  if (!doc.date || (doc.root !== "blogs" && doc.root !== "books")) return [];

  const hidden: HTMLElement[] = [];
  const dateNode = Array.from(target.children).find(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && node.textContent?.trim() === String(doc.date).trim(),
  );
  if (!dateNode || dateNode.dataset.contentTimeLegacyHidden === "true") return hidden;

  dateNode.hidden = true;
  dateNode.dataset.contentTimeLegacyHidden = "true";
  hidden.push(dateNode);

  if (doc.root === "blogs") {
    const previous = dateNode.previousElementSibling;
    if (previous instanceof HTMLElement && previous.classList.contains("dot")) {
      previous.hidden = true;
      previous.dataset.contentTimeLegacyHidden = "true";
      hidden.push(previous);
    }
  }

  return hidden;
}

function InlineTimeMeta({ doc }: { doc: Doc }) {
  const published = formatContentTime(doc.publishedAt);
  const modified = formatContentTime(doc.modifiedAt);
  if (!published && !modified) return null;

  if (doc.root === "blogs") {
    return (
      <>
        {published ? (
          <>
            <span className="dot content-time-dot" />
            <span data-content-time="published">发布于 {published}</span>
          </>
        ) : null}
        {modified ? (
          <>
            <span className="dot content-time-dot" />
            <span data-content-time="modified">更新于 {modified}</span>
          </>
        ) : null}
      </>
    );
  }

  if (doc.root === "books") {
    return (
      <>
        {published ? <span data-content-time="published">发布于 {published}</span> : null}
        {modified ? <span data-content-time="modified">更新于 {modified}</span> : null}
      </>
    );
  }

  return (
    <div className="post-meta content-time-meta" data-content-time-meta>
      {published ? <span data-content-time="published">发布于 {published}</span> : null}
      {published && modified ? <span className="dot" /> : null}
      {modified ? <span data-content-time="modified">更新于 {modified}</span> : null}
    </div>
  );
}

export default function ContentTimeMetaPortal() {
  const location = useLocation();
  const currentPath = decodedPathname(location.pathname).replace(/\/$/, "") || "/";
  const doc = allDocs.find((item) => item.path === currentPath);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(null);
    if (!doc) return;

    const hiddenNodes = new Set<HTMLElement>();
    const selector = targetSelector(doc);
    let frame = 0;

    const sync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextTarget = document.querySelector<HTMLElement>(selector);
        if (!nextTarget) return;
        hideLegacyDate(nextTarget, doc).forEach((node) => hiddenNodes.add(node));
        setTarget((current) => (current === nextTarget ? current : nextTarget));
      });
    };

    sync();
    const root = document.getElementById("root");
    const observer = new MutationObserver(sync);
    if (root) observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      hiddenNodes.forEach((node) => {
        node.hidden = false;
        delete node.dataset.contentTimeLegacyHidden;
      });
    };
  }, [doc?.path]);

  if (!doc || !target) return null;
  return createPortal(<InlineTimeMeta doc={doc} />, target);
}
