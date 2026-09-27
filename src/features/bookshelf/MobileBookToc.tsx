import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PageTocLinks, type PageHeading } from "../docs/PageToc";

let bodyScrollLockCount = 0;
let bodyOverflowBeforeLocks = "";

function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    bodyOverflowBeforeLocks = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  bodyScrollLockCount += 1;
}

function unlockBodyScroll() {
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = bodyOverflowBeforeLocks;
  }
}

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null);
}

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
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const media = window.matchMedia("(max-width: 760px)");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) return;
      const focusable = focusableElements(sheetRef.current);
      if (!focusable.length) {
        event.preventDefault();
        sheetRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!sheetRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) onClose();
    };

    lockBodyScroll();
    window.addEventListener("keydown", handleKeyDown);
    media.addEventListener("change", handleViewportChange);

    requestAnimationFrame(() => {
      sheetRef.current
        ?.querySelector<HTMLElement>(".book-reader-mobile-toc-close")
        ?.focus();
    });

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", handleKeyDown);
      media.removeEventListener("change", handleViewportChange);
      if (previousFocus?.isConnected) previousFocus.focus();
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
        ref={sheetRef}
        id="book-reader-mobile-toc-sheet"
        className="book-reader-mobile-toc-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-reader-mobile-toc-title"
        tabIndex={-1}
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
