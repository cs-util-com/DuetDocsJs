// html-export-helper.js — HTML Export Utilities
// Utilities for creating properly formatted, standalone HTML documents from rich text editor content
/* global DOMPurify */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node / CommonJS
    module.exports = factory();
  } else {
    // Browser (UMD)
    root.htmlExportHelper = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  /**
   * Create a complete HTML document for export
   * @param {string} content - The HTML content to wrap
   * @param {string} title - The document title
   * @param {boolean} isDark - Whether to use dark theme styling
   * @returns {string} Complete HTML document
   */
  function createCompleteHtmlDocument(content, title, isDark = false) {
    // extract helpers to lower complexity
    function sanitizeContent(c) {
      if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
        return DOMPurify.sanitize(c, {
          KEEP_CONTENT: true,
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                       'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                       'code', 'pre', 'span', 'div', 'sub', 'sup'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel']
        });
      }
      return c
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
    }

    function buildStyles(dark) {
      return `
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: ${dark ? '#e0e0e0' : '#333'}; background-color: ${dark ? '#1e1e1e' : '#fff'}; }
        h1, h2, h3, h4, h5, h6 { color: ${dark ? '#fff' : '#000'}; margin: 1.5em 0 0.5em 0; }
        code, pre { font-family: "Monaco", "Consolas", monospace; background-color: ${dark ? '#374151' : '#f5f5f5'}; }
        code { padding: 0.2em 0.4em; border-radius: 3px; }
        pre { padding: 1em; border-radius: 5px; overflow-x: auto; }
        pre code { background: transparent; padding: 0; }
        blockquote { border-left: 4px solid ${dark ? '#4b5563' : '#ddd'}; margin: 1em 0; padding-left: 1em; color: ${dark ? '#a0a0a0' : '#666'}; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid ${dark ? '#4b5563' : '#ddd'}; padding: 8px 12px; text-align: left; }
        th { background-color: ${dark ? '#374151' : '#f9f9f9'}; font-weight: bold; }
        img { max-width: 100%; height: auto; }
        a { color: ${dark ? '#60a5fa' : '#0066cc'}; }
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        @media print { body { color: #000; background: #fff; } }
      `;
    }

    const sanitizedContent = sanitizeContent(content);
    const styles = buildStyles(isDark);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${styles}</style>
</head>
<body>
${sanitizedContent}
</body>
</html>`;
  }

  return {
    createCompleteHtmlDocument
  };
});
