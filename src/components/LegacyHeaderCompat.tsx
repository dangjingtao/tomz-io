import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Share2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function LegacyHeaderCompat() {
  const location = useLocation();
  const [navRight, setNavRight] = useState<HTMLElement | null>(null);
  const [hasDocShare, setHasDocShare] = useState(false);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".top-nav");
    setNavRight(nav?.querySelector<HTMLElement>(".nav-right") ?? null);
    setHasDocShare(Boolean(document.querySelector(".doc-title-block > .share-button")));
  }, [location.pathname]);

  const triggerShare = () => {
    document.querySelector<HTMLButtonElement>(".doc-title-block > .share-button")?.click();
  };

  if (!navRight || !hasDocShare) return null;

  return createPortal(
    <div className="mobile-doc-share">
      <button
        type="button"
        className="share-button"
        onClick={triggerShare}
        aria-label="分享页面"
      >
        <Share2 size={16} aria-hidden="true" />
        <span>分享</span>
      </button>
    </div>,
    navRight,
  );
}
