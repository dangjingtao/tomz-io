import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import { slug } from '../content/mira-docs-adapter';

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character,
  );
}
function removeMarkdownH1(source: string) {
  let inFence = false;
  return source
    .split(/\r?\n/)
    .filter((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return true;
      }
      return inFence || !/^#\s+/.test(line);
    })
    .join("\n");
}
export function renderMarkdown(source: string) {
  const withoutTitles = removeMarkdownH1(source);
  const htmlBlocks: string[] = [];
  const prepared = withoutTitles
    .replace(
      /::: tip ([\s\S]*?):::/g,
      '<div class="md-custom-block"><strong>提示</strong><p>$1</p></div>',
    )
    .replace(/::: html\s*([\s\S]*?):::/g, (_, html) => {
      const index = htmlBlocks.push(html.trim()) - 1;
      return `MIRA_HTML_BLOCK_${index}`;
    });
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    const language = lang?.trim().toLowerCase();
    if (language === "mermaid") {
      return `<div class="markdown-mermaid" data-mermaid data-mermaid-source="${escapeHtml(text)}"></div>`;
    }
    const highlighted =
      language && hljs.getLanguage(language)
        ? hljs.highlight(text, { language, ignoreIllegals: true }).value
        : hljs.highlightAuto(text).value;
    const languageClass =
      language && /^[a-z0-9-]+$/.test(language) ? ` language-${language}` : "";
    return `<pre><code class="hljs${languageClass}">${highlighted}</code></pre>`;
  };
  let html = marked.parse(prepared, { gfm: true, renderer }) as string;
  htmlBlocks.forEach((block, index) => {
    const placeholder = `MIRA_HTML_BLOCK_${index}`;
    html = html.replace(
      new RegExp(`<p>${placeholder}<\\/p>|${placeholder}`, "g"),
      block,
    );
  });
  return html.replace(
    /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g,
    (_, level, attributes, text) => {
      if (/\bid\s*=\s*["'][^"']+["']/i.test(attributes)) {
        return `<h${level}${attributes}>${text}</h${level}>`;
      }
      const id = slug(text);
      return id
        ? `<h${level}${attributes} id="${id}">${text}<a class="md-anchor" href="#${id}">#</a></h${level}>`
        : `<h${level}${attributes}>${text}</h${level}>`;
    },
  );
}
