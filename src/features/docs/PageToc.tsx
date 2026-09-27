export type PageHeading = {
  id: string;
  text: string;
};

export function PageTocLinks({
  headings,
  activeHeading,
  numbered = false,
  onNavigate,
}: {
  headings: readonly PageHeading[];
  activeHeading?: string;
  numbered?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="page-toc-links">
      {headings.map((heading, index) => {
        const active = activeHeading === heading.id;
        return (
          <li key={heading.id}>
            <a
              className={active ? "active" : ""}
              href={`#${heading.id}`}
              aria-current={active ? "location" : undefined}
              onClick={onNavigate}
            >
              {numbered ? (
                <span className="page-toc-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : null}
              <span>{heading.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function PageToc({
  headings,
  activeHeading,
  label = "本页目录",
  className = "toc",
  numbered = false,
  headingAs: Heading = "h5",
}: {
  headings: readonly PageHeading[];
  activeHeading?: string;
  label?: string;
  className?: string;
  numbered?: boolean;
  headingAs?: "h5" | "span";
}) {
  if (!headings.length) return null;

  return (
    <aside className={className}>
      <Heading>{label}</Heading>
      <PageTocLinks
        headings={headings}
        activeHeading={activeHeading}
        numbered={numbered}
      />
    </aside>
  );
}
