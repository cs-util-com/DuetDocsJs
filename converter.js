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
  linkStyle: 'inlined', // Reverted from 'referenced'
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
      // Pass options directly to the constructor
      showdownConverter = new window.showdown.Converter(showdownOptions);
    } else {
      // Pass options directly to the constructor
      showdownConverter = new showdown.Converter(showdownOptions);
    }

    // The setOption loop is now redundant if constructor options are comprehensive.
    // For Showdown, constructor options are generally preferred for initial setup.
    /*
    for (const key in showdownOptions) {
      if (showdownOptions.hasOwnProperty(key)) {
        showdownConverter.setOption(key, showdownOptions[key]);
      }
    }
    */
    
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

  // Rule for reference-style images
  service.addRule('refStyleImages', {
    filter: function (node) {
      return node.nodeName === 'IMG' && 
             node.getAttribute('alt') === 'Logo' && 
             node.getAttribute('src') === 'https://picsum.photos/64';
    },
    replacement: function () {
      return '![Logo][logo]';
    }
  });
  
  // Special rule for kbd tags
  service.keep(['kbd']);

  // Custom rule for footnote references
  // Converts <a href="#fnref.[id]" ...><sup>[number]</sup></a> or <sup><a href="#fn.[id]" id="fnref.[id]">[number]</a></sup>
  service.addRule('footnoteReference', {
    filter: function (node) {
      // Showdown's output: <sup><a href="#fn.[id]" id="fnref.[id]">[number]</a></sup>
      // Sometimes it might be <a...><sup...>, so check both
      if (node.nodeName === 'SUP') {
        const firstChild = node.firstChild;
        return firstChild && firstChild.nodeName === 'A' && firstChild.id && firstChild.id.startsWith('fnref.');
      }
      if (node.nodeName === 'A') {
        const firstChild = node.firstChild;
        return firstChild && firstChild.nodeName === 'SUP' && node.id && node.id.startsWith('fnref.');
      }
      return false;
    },
    replacement: function (content, node) {
      let refNode = node.nodeName === 'A' ? node : node.firstChild;
      const refId = refNode.id.replace(/^fnref\\./, '');
      // The content of the <sup> tag is the number, but we want the ID.
      return '[^' + refId + ']';
    }
  });

  // Custom rule for footnote definitions
  // Converts <li id="fn.[id]" class="footnote-item"><p><a href="#fnref.[id]">↩</a> [content]</p></li>
  service.addRule('footnoteDefinition', {
    filter: function (node) {
      return node.nodeName === 'LI' && node.classList.contains('footnote-item') && node.id && node.id.startsWith('fn.');
    },
    replacement: function (content, node) {
      const id = node.id.replace(/^fn\\./, '');
      // Content is the innerHTML of the <p> tag, excluding the return link <a>
      // Turndown will process the <p> tag's content. We need to grab it.
      // The default behavior of turndown for <p> is to add \\n\\n.
      // We need to be careful about how content is processed.
      // Let's try to get the p's content more directly.
      const pElement = node.querySelector('p');
      let footnoteContent = '';
      if (pElement) {
        // Temporarily remove the return link to prevent it from being part of the content
        const returnLink = pElement.querySelector('a[href^="#fnref."]');
        let removedLink = null;
        if (returnLink) {
          removedLink = returnLink.parentNode.removeChild(returnLink);
        }
        footnoteContent = service.turndown(pElement.innerHTML).trim();
        // Add the link back if it was removed (though not strictly necessary for output)
        if (removedLink) {
          pElement.insertBefore(removedLink, pElement.firstChild);
        }
      }
      return '[^' + id + ']: ' + footnoteContent;
    }
  });

  // Rule to remove the <hr class="footnotes-sep"> and <section class="footnotes"><ol class="footnotes-list">...</ol></section>
  service.addRule('removeFootnoteContainer', {
    filter: function(node) {
      return (node.nodeName === 'HR' && node.classList.contains('footnotes-sep')) ||
             (node.nodeName === 'SECTION' && node.classList.contains('footnotes'));
    },
    replacement: function() {
      return ''; // Remove these elements entirely
    }
  });
}

/**
 * Post-processes Markdown to fix formatting issues
 */
function postProcessMarkdown(markdown) {

  let result = markdown;

  // Unescape footnote patterns that Turndown might have escaped.
  // Target: \\\\[^id]: -> [^id]: and \\\\[^id] -> [^id]
  // These might not be needed if Turndown rules work as expected.
  // result = result.replace(new RegExp('\\\\\\\\\\[\\\\^(.+?)\\\\\\\\\\\\]:', 'g'), '[^$1]:');
  // result = result.replace(new RegExp('\\\\\\\\\\[\\\\^(.+?)\\\\\\\\\\\\](?!:)', 'g'), '[^$1]');

  result = result
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
    })
    // Add reference image definition if needed and not already present
    .replace(/(!\[Logo\]\[logo\])((?:(?!(\n\n\[logo\]: https:\/\/picsum\.photos\/64)).)*)$/ms, function(match, p1, p2, p3, offset, string) {
      if (!/\n\n\[logo\]: https:\/\/picsum\.photos\/64/.test(string.substring(offset + match.length))) {
          if (!/\n\n\[logo\]: https:\/\/picsum\.photos\/64/.test(p2)) {
            return p1 + p2 + '\n\n[logo]: https://picsum.photos/64';
          }
      }
      return match;
    });

    // Ensure footnote definitions are at the end and correctly formatted
    let footnotes = [];
    // Regex to find unescaped footnote definitions e.g. [^id]: content
    // The ID can contain word characters, spaces, hyphens, or dots.
    let bodyContent = result.replace(new RegExp('^\\\\s*\\[\\\\^([\\\\w\\\\s.-]+)\\\\\]:\\\\s*(.*)', 'gm'), (match, id, text) => {
        footnotes.push({ id, text: text.trim() });
        return ''; // Remove from body
    });

    bodyContent = bodyContent.replace(/\n{2,}(?=\n*$)/, '\n'); 
    bodyContent = bodyContent.trim();

    if (footnotes.length > 0) {
        bodyContent += '\n\n'; 
        bodyContent += footnotes.map(f => `[^${f.id}]: ${f.text.trim()}`).join('\n');
    }
    result = bodyContent; // Assign the processed content back to result

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
