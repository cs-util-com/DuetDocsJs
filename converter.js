// filepath: /workspaces/DuetDocsJs/converter.js
// Determine environment and load dependencies
let Showdown, TurndownService;
const isNode = typeof window === 'undefined';

if (isNode) {
  // Running in Node.js environment
  Showdown = require('showdown');
  TurndownService = require('turndown');
} else {
  // Running in browser environment
  Showdown = window.showdown;
  TurndownService = window.TurndownService;
}

// Initialize converters
const showdownConverter = new Showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: true,
  parseImgDimensions: true,
  literalMidWordUnderscores: true,
  smartIndentationFix: true,
});

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
});

// Helper function (remains local)
function normalizeQuillLists(html) {
  if (isNode) {
      // Basic fallback for Node.js (no DOM manipulation)
      // More robust server-side DOM might be needed for perfect parity (e.g., jsdom)
      return html;
  }
  // Browser environment with DOM access
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  // Example normalization: Convert <ol><li data-list="bullet">...</li></ol> to <ul><li>...</li></ul>
  wrapper.querySelectorAll('ol').forEach((ol) => {
      const lis = [...ol.children].filter((c) => c.tagName === 'LI');
      if (lis.length && lis.every((li) => li.getAttribute('data-list') === 'bullet')) {
          const ul = document.createElement('ul');
          lis.forEach((li) => li.removeAttribute('data-list')); // Clean up attribute
          ul.innerHTML = ol.innerHTML; // Move content
          ol.replaceWith(ul);
      }
  });
  return wrapper.innerHTML;
}

/**
 * Converts Markdown text to HTML.
 * @param {string} markdown - The Markdown string.
 * @returns {string} The resulting HTML string.
 */
export function markdownToHtml(markdown) {
  return showdownConverter.makeHtml(markdown);
}

/**
 * Converts HTML text to Markdown.
 * Includes normalization for Quill list structures.
 * @param {string} html - The HTML string.
 * @returns {string} The resulting Markdown string.
 */
export function htmlToMarkdown(html) {
  const normalizedHtml = normalizeQuillLists(html);
  return turndownService.turndown(normalizedHtml);
}

// Conditional export for Node.js (CommonJS) environment if needed by tests
// Note: This dual export approach can sometimes be problematic. 
// If tests fail, consider aligning test environment to use ES modules.
if (isNode) {
  module.exports = { markdownToHtml, htmlToMarkdown };
}
