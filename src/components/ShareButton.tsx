import { useState } from "react";
import { Share2 } from "lucide-react";

export default function ShareButton({ title, text }: { title: string; text?: string }) {
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
