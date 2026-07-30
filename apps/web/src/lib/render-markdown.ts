const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const applyInlineMarkdown = (value: string) => {
  const escaped = escapeHtml(value);

  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
};

const flushParagraph = (lines: string[], html: string[]) => {
  if (!lines.length) return;
  html.push(`<p>${applyInlineMarkdown(lines.join(" "))}</p>`);
  lines.length = 0;
};

const flushList = (items: string[], html: string[], ordered: boolean) => {
  if (!items.length) return;
  const tag = ordered ? "ol" : "ul";
  html.push(`<${tag}>${items.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join("")}</${tag}>`);
  items.length = 0;
};

export const renderMarkdown = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const paragraph: string[] = [];
  const unorderedList: string[] = [];
  const orderedList: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph(paragraph, html);
      flushList(unorderedList, html, false);
      flushList(orderedList, html, true);

      if (inCodeBlock) {
        html.push(`<pre class="markdown-code"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }

      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (!trimmed) {
      flushParagraph(paragraph, html);
      flushList(unorderedList, html, false);
      flushList(orderedList, html, true);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      flushParagraph(paragraph, html);
      flushList(unorderedList, html, false);
      flushList(orderedList, html, true);
      const [, hashes = "", headingText = ""] = headingMatch;
      const level = hashes.length;
      html.push(`<h${level + 1}>${applyInlineMarkdown(headingText)}</h${level + 1}>`);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);

    if (unorderedMatch) {
      flushParagraph(paragraph, html);
      flushList(orderedList, html, true);
      unorderedList.push(unorderedMatch[1] ?? "");
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (orderedMatch) {
      flushParagraph(paragraph, html);
      flushList(unorderedList, html, false);
      orderedList.push(orderedMatch[1] ?? "");
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph(paragraph, html);
      flushList(unorderedList, html, false);
      flushList(orderedList, html, true);
      html.push(`<blockquote>${applyInlineMarkdown(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph(paragraph, html);
  flushList(unorderedList, html, false);
  flushList(orderedList, html, true);

  if (inCodeBlock) {
    html.push(`<pre class="markdown-code"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
};
