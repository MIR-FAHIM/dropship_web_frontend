/**
 * Converts HTML content to clean, human-readable plain text.
 * Preserves paragraph breaks, headings, line breaks (<br>), and list bullets (<li>).
 * Decodes all HTML entities and strips unwanted scripts, styles, and tags.
 */
export const htmlToPlainText = (html) => {
  if (!html || typeof html !== "string") return "";

  // If there are no HTML tags, return as trimmed text
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.trim();
  }

  if (typeof document !== "undefined") {
    // Replace block-level tags and line-breaks before parsing to preserve proper paragraphing & bullet formatting
    const formatted = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n");

    const temp = document.createElement("div");
    temp.innerHTML = formatted;
    const rawText = temp.textContent || temp.innerText || "";

    return rawText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Fallback for SSR or non-DOM
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
