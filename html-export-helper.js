// html-export-helper.js — HTML Export Utilities
// Utilities for creating properly formatted, standalone HTML documents from rich text editor content

/* global window, DOMPurify */
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
    // Use DOMPurify for proper HTML sanitization if available
    let sanitizedContent;
    if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
      sanitizedContent = DOMPurify.sanitize(content, {
        KEEP_CONTENT: true,
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                     'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                     'code', 'pre', 'span', 'div', 'sub', 'sup'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel']
      });
    } else {
      // Fallback sanitization
      sanitizedContent = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: ${isDark ? '#e0e0e0' : '#333333'};
            background-color: ${isDark ? '#1e1e1e' : '#ffffff'};
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            color: ${isDark ? '#ffffff' : '#000000'};
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
        }
        
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1.1em; }
        h5 { font-size: 1em; }
        h6 { font-size: 0.9em; }
        
        /* Text formatting */
        strong, .ql-font-bold { font-weight: bold; }
        em, .ql-font-italic { font-style: italic; }
        u, .ql-underline { text-decoration: underline; }
        s, .ql-strike { text-decoration: line-through; }
        
        /* Lists */
        ul, ol {
            padding-left: 1.5em;
            margin: 1em 0;
        }
        
        li {
            margin: 0.25em 0;
        }
        
        /* Blockquotes */
        blockquote {
            border-left: 4px solid ${isDark ? '#4b5563' : '#d1d5db'};
            margin: 1em 0;
            padding-left: 1em;
            color: ${isDark ? '#a0a0a0' : '#666666'};
            font-style: italic;
        }
        
        /* Code */
        code {
            background-color: ${isDark ? '#374151' : '#f3f4f6'};
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: ${isDark ? '#374151' : '#f3f4f6'};
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
        }
        
        /* Links */
        a {
            color: ${isDark ? '#60a5fa' : '#2563eb'};
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Images */
        img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
        }
        
        /* Tables */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        
        th, td {
            border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: ${isDark ? '#374151' : '#f9fafb'};
            font-weight: bold;
        }
        
        /* Text alignment classes */
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        
        /* Text size classes */
        .ql-size-small { font-size: 0.8em; }
        .ql-size-large { font-size: 1.2em; }
        .ql-size-huge { font-size: 1.5em; }
        
        /* Indentation */
        .ql-indent-1 { margin-left: 1.5em; }
        .ql-indent-2 { margin-left: 3em; }
        .ql-indent-3 { margin-left: 4.5em; }
        .ql-indent-4 { margin-left: 6em; }
        .ql-indent-5 { margin-left: 7.5em; }
        .ql-indent-6 { margin-left: 9em; }
        .ql-indent-7 { margin-left: 10.5em; }
        .ql-indent-8 { margin-left: 12em; }
        
        /* Remove default margins on first/last elements */
        *:first-child { margin-top: 0; }
        *:last-child { margin-bottom: 0; }
        
        @media print {
            body {
                color: #000;
                background-color: #fff;
            }
        }
    </style>
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
