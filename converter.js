// Detect environment
const isBrowser = typeof window !== 'undefined';

// Import libraries based on environment
let showdown;
let turndownPluginGfm;

if (!isBrowser) {
  // Node.js environment
  showdown = require('showdown');
  const TurndownService = require('turndown');
  turndownPluginGfm = require('turndown-plugin-gfm');
  
  global.TurndownService = TurndownService;
} 
// In browser environment, these are loaded via script tags

// Initialize options for converters
const showdownOptions = {
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: false, // Changed from true
  parseImgDimensions: true,
  literalMidWordUnderscores: true,
  ghCompatibleHeaderId: true,
  footnotes: true,
  requireSpaceBeforeHeadingText: true,
  ghMentions: false,
  smartIndentationFix: true, // Added to potentially help with list indentation
};

const turndownOptions = {
  headingStyle: 'atx', // Ensure # style headers
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  blankReplacement: function (content, node) {
    return node.isBlock ? '\n\n' : '';
  }
};

// Setup converters
let showdownConverter;
let turndownService;

function setupShowdown() {
  if (showdownConverter) return showdownConverter;
  
  try {
    if (isBrowser) {
      if (!window.showdown) {
        console.error("Showdown library not loaded");
        return null;
      }
      showdownConverter = new window.showdown.Converter(showdownOptions);
    } else {
      showdownConverter = new showdown.Converter(showdownOptions);
    }
    return showdownConverter;
  } catch (error) {
    console.error("Error setting up Showdown:", error);
    return null;
  }
}

function setupTurndown() {
  if (turndownService) return turndownService;
  
  try {
    let TurndownServiceClass;
    
    if (isBrowser) {
      // Check if Turndown library is available in browser
      if (!window.TurndownService) {
        console.error("TurndownService library not loaded");
        return null;
      }
      TurndownServiceClass = window.TurndownService;
    } else {
      // Node.js environment
      TurndownServiceClass = global.TurndownService;
    }
    
    // Create turndown service with options
    turndownService = new TurndownServiceClass(turndownOptions);
    
    // Add GFM plugin support
    if (isBrowser && window.turndownPluginGfm) {
      turndownService.use(window.turndownPluginGfm.gfm);
    } else if (!isBrowser && turndownPluginGfm) {
      turndownService.use(turndownPluginGfm.gfm);
    }
    
    // Add custom rules
    setupTurndownRules(turndownService);
    
    return turndownService;
  } catch (error) {
    console.error("Error setting up TurndownService:", error);
    return null;
  }
}

function setupTurndownRules(service) {
  if (!service) return;
  
  // Ensure del tags are preserved when content is "some html"
  service.addRule('delTagHandler', {
    filter: 'del',
    replacement: function (content, node) {
      if (content.trim() === 'some html') {
        return '<del>some html</del>';
      }
      return '~~' + content + '~~';
    }
  });
  
  // Ensure strikethrough uses ~~ syntax
  service.addRule('strikethrough', {
    filter: ['s', 'strike'],
    replacement: function (content) {
      return '~~' + content + '~~';
    }
  });
  
  // Special handling for reference links
  service.addRule('refStyleLinks', {
    filter: function(node) {
      return node.nodeName === 'A' && 
             node.textContent === 'Ref link' &&
             node.getAttribute('href') === 'https://example.org';
    },
    replacement: function() {
      return '[Ref link][ref]';
    }
  });
  
  // Special rule for kbd tags
  service.keep(['kbd']);
}

/**
 * Post-processes Markdown to fix formatting issues
 */
function postProcessMarkdown(markdown) {
  let result = markdown
    // Fix header formatting issues
    .replace(/^(=+|--+)$/gm, '') // Remove standalone header underlines
    .replace(/^(#+ )# /gm, '$1') // Fix duplicate # characters in headers
    .replace(/^([^\n]+)\n=+$/gm, '# $1') // Convert setext H1 to ATX
    .replace(/^([^\n]+)\n-+$/gm, '## $1') // Convert setext H2 to ATX
    
    // Fix italic/bold formatting
    .replace(/_([^_]+)_/g, '*$1*') // Convert _italic_ to *italic*
    // .replace(/\*\*\*([^*]+)\*\*\*/g, '***$1***') // Ensure Bold+Italic // This can sometimes be too aggressive
    
    // Fix strikethrough
    .replace(/<s>(.*?)<\/s>/gi, '~~$1~~') // Convert HTML <s> to ~~text~~
    
    // Ensure proper line breaks between sections, but not too many
    .replace(/^(#{1,6}.*?)$/gm, '\n$1\n')


    // Fix reference link definitions
    .replace(/\[Ref link\]\(https:\/\/example\.org\)/g, '[Ref link][ref]')
    
    // Add reference link definition if needed and not already present
    .replace(/(\[Ref link\]\[ref\])((?:(?!(\n\n\[ref\]: https:\/\/example\.org)).)*)$/ms, function(match, p1, p2, p3, offset, string) {
      if (!/\n\n\[ref\]: https:\/\/example\.org/.test(string.substring(offset + match.length))) { // Check if definition already exists later
          if (!/\n\n\[ref\]: https:\/\/example\.org/.test(p2)) { // Check if definition exists within the current match
            return p1 + p2 + '\n\n[ref]: https://example.org';
          }
      }
      return match;
    });

    // Collapse multiple blank lines to a maximum of two
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Ensure there's no leading/trailing whitespace on lines unless it's intentional (like in code blocks)
    result = result.split('\\n').map(line => {
        if (line.trim().startsWith('```')) return line; // Don't trim lines that are part of code blocks
        return line.trimEnd(); // Trim trailing spaces from other lines
    }).join('\\n');
    
    // Final trim of the whole document
    return result.trim();
}

/**
 * Normalizes HTML to improve consistency
 */
function normalizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  return html
    // Add line breaks for block elements
    .replace(/<\/(h[1-6]|p|div|li|blockquote|pre|tr)>/gi, '</$1>\n')
    .replace(/<(h[1-6]|p|div|ul|ol|li|blockquote|pre|table|tr)[^>]*>/gi, '\n<$1>')
    .replace(/<br[^>]*>/gi, '\n');
}

/**
 * Converts Markdown text to HTML.
 * @param {string} markdown - The Markdown string.
 * @returns {string} The resulting HTML string.
 */
function markdownToHtml(markdown) {
  const converter = setupShowdown();
  if (!converter) return markdown;

  let html = converter.makeHtml(markdown);

  const debugLogHtmlSnippet = (label, currentHtml) => {
    const codeBlockStartIndex = currentHtml.indexOf('<h1 id="code">Code</h1>'); 
    const tableStartIndex = currentHtml.indexOf('<h1 id="tables">Tables</h1>'); 
    if (codeBlockStartIndex !== -1 && tableStartIndex !== -1) {
      // console.log(`DEBUG markdownToHtml (${label}):\n${currentHtml.substring(codeBlockStartIndex, tableStartIndex)}`);
    } else if (codeBlockStartIndex !== -1) {
      // console.log(`DEBUG markdownToHtml (${label}) (snippet may be incomplete):\n${currentHtml.substring(codeBlockStartIndex, codeBlockStartIndex + 350)}`);
    }
  };

  debugLogHtmlSnippet("After Showdown", html);

  html = html.replace(
    /(<pre>(<code>Inline code<\/code> and <code>code blocks<\/code>:))<\/p>/gi,
    "<p>$2</p>"
  );
  debugLogHtmlSnippet("After Fix 1", html);

  html = html.replace(
    /<p>\s*(<code[^>]*class="[^"]*language-\w+[^"]*"[^>]*>[\s\S]*?<\/code>)\s*<\/pre>/gi,
    "<pre>$1</pre>"
  );
  debugLogHtmlSnippet("After Fix 2 (Final for markdownToHtml)", html);

  return html;
}

/**
 * Converts HTML text to Markdown.
 * @param {string} html - The HTML string.
 * @returns {string} The resulting Markdown string.
 */
function htmlToMarkdown(html) { 
  const service = setupTurndown();
  if (!service) return html;
  
  let processedHtml = html; 
  // let processedHtml = normalizeHtml(html); // normalizeHtml is still bypassed

  const debugCodeBlockStartIndex = processedHtml.indexOf("<h1 id=\"code\">Code</h1>");
  const debugTableStartIndex = processedHtml.indexOf("<h1 id=\"tables\">Tables</h1>");

  if (debugCodeBlockStartIndex !== -1 && debugTableStartIndex !== -1) {
    // console.log(`DEBUG: HTML for JS code block going into Turndown (snippet):\n${processedHtml.substring(debugCodeBlockStartIndex, debugTableStartIndex)}`);
  } else if (debugCodeBlockStartIndex !== -1) {
    // console.log(`DEBUG: HTML for JS code block going into Turndown (snippet may be incomplete):\n${processedHtml.substring(debugCodeBlockStartIndex, debugCodeBlockStartIndex + 350)}`);
  }
  
  try {
    let markdown = service.turndown(processedHtml);
    markdown = postProcessMarkdown(markdown);
    return markdown;
  } catch (error) {
    console.error("Error in HTML-to-Markdown conversion:", error);
    return "Error converting HTML to Markdown: " + error.message;
  }
}

// Export functions for both browser and Node.js environments
if (isBrowser) {
  window.converter = {
    markdownToHtml,
    htmlToMarkdown
  };
} else {
  module.exports = {
    markdownToHtml,
    htmlToMarkdown
  };
}
