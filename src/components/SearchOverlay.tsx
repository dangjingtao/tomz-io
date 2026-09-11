import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { allDocs } from "../content/mira-docs-adapter";

export default function SearchOverlay({
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
    if (!normalized) return allDocs.slice(0, 8);
    return allDocs
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
