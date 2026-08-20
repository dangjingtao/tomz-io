import type { SyntheticEvent } from "react";

export type SignatureAuthor = {
  name: string;
  avatar: string;
  onAvatarError?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

export type SignatureLink = {
  label: string;
  href: string;
};

type AuthorSignatureProps = {
  authors: SignatureAuthor[];
  title: string;
  body?: string;
  kicker?: string;
  links?: SignatureLink[];
  accentClassName?: string;
};

export default function AuthorSignature({
  authors,
  title,
  body,
  kicker,
  links = [],
  accentClassName = "",
}: AuthorSignatureProps) {
  const relationship = authors.length > 1 ? "duo" : "solo";

  return (
    <section
      className={`author-signature author-signature-${relationship} ${accentClassName}`}
      aria-label={`${title} 署名`}
    >
      <div
        className={`author-signature-avatars author-signature-avatars-${authors.length}`}
        aria-label={authors.map((author) => author.name).join("与")}
      >
        {authors.map((author) => (
          <img
            alt={author.name}
            className="author-signature-avatar"
            key={author.name}
            src={author.avatar}
            onError={author.onAvatarError}
          />
        ))}
      </div>
      <div className="author-signature-copy">
        {kicker ? <span className="author-signature-kicker">{kicker}</span> : null}
        <h4>{title}</h4>
        {body ? <p>{body}</p> : null}
        {links.length ? (
          <div className="author-signature-links">
            {links.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
