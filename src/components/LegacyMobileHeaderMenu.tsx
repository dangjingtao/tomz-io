import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function LegacyMobileHeaderMenu() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>(".top-nav .nav-right"));
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".top-nav");
    if (!nav) return;
    nav.classList.toggle("legacy-mobile-open", open);
    return () => nav.classList.remove("legacy-mobile-open");
  }, [open, target, location.pathname]);

  if (!target) return null;

  return createPortal(
    <button
      type="button"
      className="mobile-menu-button"
      aria-label={open ? "关闭导航" : "打开导航"}
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
    >
      {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
    </button>,
    target,
  );
}
