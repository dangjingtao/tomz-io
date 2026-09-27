import { useEffect } from "react";
import { X } from "lucide-react";
import { PageTocLinks, type PageHeading } from "../docs/PageToc";

export default function MobileBookToc({
  open,
  headings,
  activeHeading,
  onClose,
}: {
  open: boolean;
  headings: readonly PageHeading[];
  activeHeading: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const media = window.matchMedia("(max-width: 760px)");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    media.addEventListener("change", handleViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      media.removeEventListener("change", handleViewportChange);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="book-reader-mobile-toc-layer">
      <button
        className="book-reader-mobile-toc-backdrop"
        type="button"
        aria-label="关闭文章目录"
        onClick={onClose}
      />
      <section
        id="book-reader-mobile-toc-sheet"
        className="book-reader-mobile-toc-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-reader-mobile-toc-title"
      >
        <header className="book-reader-mobile-toc-header">
          <div>
            <span id="book-reader-mobile-toc-title">文章目录</span>
            <small>{headings.length} 节</small>
          </div>
          <button
            className="book-reader-mobile-toc-close"
            type="button"
            onClick={onClose}
            aria-label="关闭文章目录"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="book-reader-mobile-toc-scroll">
          <PageTocLinks
            headings={headings}
            activeHeading={activeHeading}
            numbered
            onNavigate={onClose}
          />
        </div>
      </section>
    </div>
  );
}
