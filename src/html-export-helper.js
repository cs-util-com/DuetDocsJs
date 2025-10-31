// src/html-export-helper.js — HTML Export Utilities (refactored)
/* global DOMPurify */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.htmlExportHelper = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function sanitizeContent(content) {
    if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
      return DOMPurify.sanitize(content, {
        KEEP_CONTENT: true,
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          's',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'blockquote',
          'a',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'code',
          'pre',
          'span',
          'div',
          'sub',
          'sup',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'class',
          'style',
          'target',
          'rel',
        ],
      });
    }

    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }

  function buildStyles(isDark) {
    return `
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: ${isDark ? '#e0e0e0' : '#333'};
            background-color: ${isDark ? '#1e1e1e' : '#fff'};
        }
        h1, h2, h3, h4, h5, h6 {
            color: ${isDark ? '#fff' : '#000'};
            margin: 1.5em 0 0.5em 0;
        }
        code, pre { font-family: "Monaco", "Consolas", monospace; background-color: ${isDark ? '#374151' : '#f5f5f5'}; }
        code { padding: 0.2em 0.4em; border-radius: 3px; }
        pre { padding: 1em; border-radius: 5px; overflow-x: auto; }
        pre code { background: transparent; padding: 0; }
        blockquote { border-left: 4px solid ${isDark ? '#4b5563' : '#ddd'}; margin: 1em 0; padding-left: 1em; color: ${isDark ? '#a0a0a0' : '#666'}; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid ${isDark ? '#4b5563' : '#ddd'}; padding: 8px 12px; text-align: left; }
        th { background-color: ${isDark ? '#374151' : '#f9f9f9'}; font-weight: bold; }
        img { max-width: 100%; height: auto; }
        a { color: ${isDark ? '#60a5fa' : '#0066cc'}; }
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        @media print { body { color: #000; background: #fff; } }
    `;
  }

  function createCompleteHtmlDocument(content, title, isDark = false) {
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

  return { createCompleteHtmlDocument };
});
