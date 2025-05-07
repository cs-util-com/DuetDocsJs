// Determine environment and load dependencies
// No longer needed for Node.js only context in this file
// const isNode = typeof window === 'undefined';

let showdownConverter;
let turndownService;

const showdownOptions = {
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: false,
  parseImgDimensions: true,
  literalMidWordUnderscores: true,
  ghCompatibleHeaderId: true,
  footnotes: true,
  requireSpaceBeforeHeadingText: true,
  ghMentions: false,
};

const turndownOptions = {
  headingStyle: 'atx',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  keepReplacement: function (content, node) {
    return node.outerHTML;
  }
};

function getShowdownConverter() {
  if (!showdownConverter) {
    if (typeof window !== 'undefined' && window.showdown) {
      showdownConverter = new window.showdown.Converter(showdownOptions);
    } else {
      // This case should ideally not be hit in the browser if CDN loads.
      // Fallback or error for Node.js if not handled by a different entry point.
      console.error("Showdown library not available.");
      // Return a dummy converter or throw error to prevent further issues
      return { makeHtml: (md) => md }; 
    }
  }
  return showdownConverter;
}

function getTurndownService() {
  if (!turndownService) {
    if (typeof window !== 'undefined' && window.TurndownService) {
      turndownService = new window.TurndownService(turndownOptions);
      // Apply rules after service initialization
      turndownService.keep(['kbd']);
      turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: function (content) {
          return '~~' + content + '~~';
        }
      });
      turndownService.addRule('taskListItems', {
        filter: function (node, options) {
          return node.nodeName === 'LI' && node.firstChild && node.firstChild.nodeName === 'INPUT' && node.firstChild.type === 'checkbox';
        },
        replacement: function (content, node, options) {
          const checkbox = node.firstChild;
          const checked = checkbox.checked;
          let textContent = node.textContent || '';
          textContent = textContent.replace(/^\\[ \\xX\\\\]\\s*/, '').trim();
          return (checked ? '* [x] ' : '* [ ] ') + textContent;
        }
      });
    } else {
      console.error("Turndown library not available.");
      return { turndown: (html) => html };
    }
  }
  return turndownService;
}

/**
 * Converts Markdown text to HTML.
 * @param {string} markdown - The Markdown string.
 * @returns {string} The resulting HTML string.
 */
export function markdownToHtml(markdown) {
  return getShowdownConverter().makeHtml(markdown);
}

/**
 * Converts HTML text to Markdown.
 * @param {string} html - The HTML string.
 * @returns {string} The resulting Markdown string.
 */
export function htmlToMarkdown(html) {
  return getTurndownService().turndown(html);
}
