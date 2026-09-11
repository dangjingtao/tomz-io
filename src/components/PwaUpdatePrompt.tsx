import { useEffect, useState } from "react";

export default function PwaUpdatePrompt() {
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
