import { githubProfileUrl } from '../site.config';
import { authorProfiles } from '../content/author-profiles';
import type { AuthorKey, Doc } from '../content/mira-docs-adapter';
import { docHref } from './paths';

function uniqueAuthors(authors?: AuthorKey[]) {
  return [...new Set((authors || []).filter(Boolean))] as AuthorKey[];
}
export function getDocAuthors(doc: Doc) {
  const authors = uniqueAuthors(doc.author);
  return authors.length ? authors : (["tomz"] as AuthorKey[]);
}
export function getDocAuthorLabel(doc: Doc) {
  const authors = getDocAuthors(doc);
  if (authors.length === 1) return authorProfiles[authors[0]].name;
  return authors.map((author) => authorProfiles[author].name).join(" × ");
}
export function getDocAuthorAvatars(doc: Doc) {
  return getDocAuthors(doc).map((author) => authorProfiles[author]);
}
export function getDocSignature(doc: Doc) {
  const authors = getDocAuthors(doc);
  if (authors.length > 1 || doc.writingMode === "co-authored") {
    return {
      title: authors.map((author) => authorProfiles[author].name).join(" × "),
      body: "这篇文章来自署名作者之间的共同讨论与写作。",
      links: [],
      showKicker: false,
      accentClassName: "",
    };
  }
  if (authors[0] === "mira") {
    const links = [{ label: "查看 Mira 来信 →", href: docHref("/blogs") }];
    if (doc.commitUrl)
      links.push({ label: "查看发布记录 →", href: doc.commitUrl });
    return {
      title: "来自Mira",
      body: authorProfiles.mira.bio,
      links,
      showKicker: true,
      accentClassName: "is-mira",
    };
  }
  if (authors[0] === "t-zt") {
    return {
      title: authorProfiles["t-zt"].name,
      body: authorProfiles["t-zt"].bio,
      links: [{ label: "GitHub", href: "https://github.com/t-zt" }],
      showKicker: true,
      accentClassName: "",
    };
  }
  return {
    title: authorProfiles.tomz.name,
    body: "",
    links: [
      { label: "GitHub", href: githubProfileUrl },
      { label: "更多文章 →", href: docHref("/blogs") },
    ],
    showKicker: false,
    accentClassName: "",
  };
}
