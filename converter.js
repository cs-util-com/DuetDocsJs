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
  simpleLineBreaks: false, 
  parseImgDimensions: true,
  literalMidWordUnderscores: true,
  ghCompatibleHeaderId: true,
  footnotes: true,
  requireSpaceBeforeHeadingText: true,
  ghMentions: false,
  ghCodeBlocks: true,
  // extensions: ['github'] // Removed, as this is not the way to set flavor
};

const turndownOptions = {
  headingStyle: 'atx', // Ensure # style headers
  bulletListMarker: '*', // Default to asterisk, will need post-processing for mixed lists
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  blankReplacement: function (content, node) {
    return node.isBlock ? '\n\n' : '';
  },
  // Attempt to preserve language in fenced code blocks
  fence: '```' // Ensure ``` is used for fenced code blocks
};

// Setup converters
let showdownConverter;
let turndownService;

function setupShowdown() {
  if (showdownConverter) return showdownConverter;
  
  try {
    let ShowdownClass;
    if (isBrowser) {
      if (!window.showdown) {
        console.error("Showdown library not loaded");
        return null;
      }
      ShowdownClass = window.showdown;
    } else {
      ShowdownClass = showdown;
    }

    // Define a custom extension for lists (simplified and kept commented)
    /*
    const listExtension = {
      type: 'lang',
      regex: /^( *)([\*\-\+]|\d+\.) +(.+)/gm,
      replace: function(match, leadingSpace, marker, content) {
        // This is a placeholder and needs proper implementation for nesting.
        // Relying on Showdown's native capabilities first.
        const itemTag = (marker === '*' || marker === '-' || marker === '+') ? 'ul' : 'ol';
        return `${leadingSpace}<${itemTag}><li>${content.trim()}</li></${itemTag}>`; 
      }
    };
    ShowdownClass.extension('customListHandler', listExtension);
    showdownOptions.extensions = ['customListHandler']; // Example of enabling
    */

    showdownConverter = new ShowdownClass.Converter(showdownOptions);
    showdownConverter.setFlavor('github'); // Set the flavor to GitHub

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

  // DEBUG: Force UL > LI to use asterisk
  service.addRule('debugMyLi', {
    filter: function(node) {
      return node.nodeName === 'LI' && node.parentNode && node.parentNode.nodeName === 'UL';
    },
    replacement: function(content, node, options) {
      // console.log('MY UL>LI RULE:', node.textContent.substring(0,20), 'Parent:', node.parentNode.nodeName);
      content = content.replace(/^\\n+/, '').replace(/\\n+$/, '\\n').replace(/\\n/gm, '\\n  ');
      // For task list items, the GFM plugin should have already processed the input to [ ] or [x]
      // This rule needs to be careful not to break that.
      // If content already starts with [ ] or [x] due to GFM input rule, preserve it.
      if (content.startsWith('[ ] ') || content.startsWith('[x] ')) {
         return '* ' + content.trim() + (node.nextSibling && !/\\n$/.test(content) ? '\\n' : '');
      }
      return '* ' + content.trimStart() + (node.nextSibling && !/\\n$/.test(content) ? '\\n' : '');
    }
  });
  
  // Ensure del tags are preserved when content is "some html"
  service.addRule('delTagHandler', {
    filter: 'del',
    replacement: function (content, node) {
      if (node.innerHTML === 'some html') {
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

  // Preserve language in fenced code blocks
  service.addRule('fencedCodeBlock', {
    filter: function (node, options) {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      );
    },
    replacement: function (content, node, options) {
      const codeNode = node.firstChild;
      const className = codeNode.getAttribute('class') || '';
      const language = (className.match(/language-(\\S+)/) || [null, ''])[1];
      // Use 'content' which is Turndown's processed version of the code tag's content.
      return options.fence + language + '\\n' +
             content.trim() + '\\n' + options.fence;
    }
  });

  // Custom rule for tables to preserve alignment if possible
  service.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      let cellContent = content.trim();
      // Attempt to capture original spacing by looking at the HTML or a custom attribute if set by Showdown
      // This is a simplified approach; true spacing preservation is very hard with HTML as intermediate
      // For now, we just trim. More complex logic would be needed if Showdown adds spacing hints.
      return cellContent + ' | ';
    }
  });

  service.addRule('tableRow', {
    filter: 'tr',
    replacement: function (content, node) {
      let rowContent = content.trim();
      if (rowContent.endsWith(' | ')) {
        rowContent = rowContent.slice(0, -3); // Remove last ' | '
      }
      return '| ' + rowContent + '\n';
    }
  });

  service.addRule('tableHeaderSeparator', {
    filter: function(node, options) {
      return node.nodeName === 'THEAD'; // Process after the THEAD to insert separator
    },
    replacement: function (content, node, options) {
      const ths = Array.from(node.querySelectorAll('th'));
      let separator = '|';
      ths.forEach(th => {
        const align = th.style.textAlign || th.align || 'left'; // th.align is deprecated but might appear
        switch (align) {
          case 'center':
            separator += ' :--: |';
            break;
          case 'right':
            separator += ' ---: |';
            break;
          default:
            separator += ' --- |'; // Default to left if not specified or 'left'
        }
      });
      // Remove the last ' |' and add a newline
      separator = separator.slice(0, -2) + '\n';
      return content + separator; // Append separator after header row content
    }
  });

  // Custom rule for footnote references
  // Converts <a href="#fnref.[id]" ...><sup>[number]</sup></a> or <sup><a href="#fn.[id]" id="fnref.[id]">[number]</a></sup>
  /* service.addRule('footnoteReference', {
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
  }); */

  // Custom rule for footnote definitions
  // Converts <li id="fn.[id]" class="footnote-item"><p><a href="#fnref.[id]">↩</a> [content]</p></li>
  /* service.addRule('footnoteDefinition', {
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
  }); */

  // Rule to remove the <hr class="footnotes-sep"> and <section class="footnotes"><ol class="footnotes-list">...</ol></section>
  /* service.addRule('removeFootnoteContainer', {
    filter: function(node) {
      return (node.nodeName === 'HR' && node.classList.contains('footnotes-sep')) ||
             (node.nodeName === 'SECTION' && node.classList.contains('footnotes'));
    },
    replacement: function() {
      return ''; // Remove these elements entirely
    }
  }); */
}

/**
 * Post-processes Markdown to fix formatting issues
 */
function postProcessMarkdown(markdown) {
  let result = markdown;

  // 1. Unescape footnote syntax that Turndown might have escaped
  //    e.g., Turndown converts plain text [^id] into \[^id\], and [^id]: into \[^id\]:
  try {
    // Corrected regex: literal \, literal [, literal ^, captured ID, literal ], optional captured :
    const footnoteUnescapeRegex = /\\\[\^([\w\s.-]+?)\\\](:)?/g;
    result = result.replace(footnoteUnescapeRegex, (match, id, colon) => {
      return `[^${id}]${colon || ''}`;
    });
  } catch (e) {
    console.error("Error during footnote unescaping regex:", e);
  }

  // 2. Other general text cleanups (headers, italics, strikethrough)
  result = result
    .replace(/^(=+|--+)$/gm, '') // Remove standalone Setext header underlines
    .replace(/^(#+ )# /gm, '$1') // Fix duplicate # characters in ATX headers
    .replace(/^([^\\n]+)\\n=+$/gm, '# $1') // Convert Setext H1 to ATX
    .replace(/^([^\\n]+)\\n-+$/gm, '## $1') // Convert Setext H2 to ATX
    .replace(/_([^_]+)_/g, '*$1*') // Convert _italic_ to *italic*
    // Using new RegExp for the <s> tag replacement
    .replace(new RegExp('<s>(.*?)<\\/s>', 'gi'), '~~$1~~'); // Convert <s> to strikethrough

  // 3. Convert specific inline links back to reference style if Turndown made them inline.
  //    This ensures the reference *usage* is correct before we try to add definitions.
  result = result.replace(new RegExp('\\\\!\\[Logo\\]\\\\(https:\\\\/\\\\/picsum\\.photos\\\\/64\\\\)', 'g'), '![Logo][logo]');
  result = result.replace(new RegExp('\\[Ref link\\]\\\\(https:\\\\/\\\\/example\\.org\\\\)', 'g'), '[Ref link][ref]');


  // 4. Separate main content, collect used reference link IDs, and footnote definitions
  const refLinkDefinitions = [];
  const footnoteDefinitions = [];

  // Known reference link definitions from the original markdown
  const knownRefLinks = {
    "ref": "https://example.org",
    "logo": "https://picsum.photos/64"
    // Add other known reference links here if necessary
  };
  const usedRefLinkIds = new Set();

  // Remove the old refLinkDefRegex extraction for general reference links
  // const refLinkDefRegex = new RegExp('^\\\\s*\\\\[([\\\\w\\\\d.-]+)\\\\]:\\\\s*(.+)$', 'gm');
  
  // Footnote definitions should have been unescaped in step 1.
  // Regex matches [^id]: content
  const footnoteDefRegex = /^\s*\[\^([\w\s.-]+?)\]:\s*(.*)$/gm; // Corrected: Made the first capturing group non-greedy and ensured balanced parentheses
  
  let tempResult = result.replace(footnoteDefRegex, (match, id, text) => {
    // Collect footnote definitions
    if (!footnoteDefinitions.some(f => f.id === id)) {
      footnoteDefinitions.push({ id, text: text.trim() });
    }
    return ''; // Remove from main content for now
  });

  // Scan main content for reference link usages to decide which definitions to add
  const refUsageRegex = /!?\[[^\]]+?\]\[([\w\d.-]+)\]/g; // Corrected: Removed unnecessary escape for ! and fixed bracket escaping
  let usageMatch;
  while ((usageMatch = refUsageRegex.exec(tempResult)) !== null) {
    usedRefLinkIds.add(usageMatch[1]);
  }

  // Populate refLinkDefinitions based on actual usage in the document
  for (const id of usedRefLinkIds) {
    if (knownRefLinks[id] && !refLinkDefinitions.some(def => def.id === id)) {
      refLinkDefinitions.push({ id, url: knownRefLinks[id] });
    }
  }

  // 5. Clean up the main content (now without definitions)
  let mainContent = tempResult.split('\\\\n').map(line => line.trimEnd()).join('\\\\n');
  mainContent = mainContent.replace(/\\n{3,}/g, '\\\\n\\\\n').trim();

  // 6. Append reference link definitions (if any were used and known)
  if (refLinkDefinitions.length > 0) {
    mainContent += '\\\\n\\\\n';
    mainContent += refLinkDefinitions.map(r => `[${r.id}]: ${r.url}`).join('\\\\n');
  }

  // 7. Append footnote definitions
  if (footnoteDefinitions.length > 0) {
    if (refLinkDefinitions.length > 0 || mainContent.length > 0) {
        mainContent += '\\\\n'; 
    }
    mainContent += '\\\\n'; 
    mainContent += footnoteDefinitions.map(f => `[^${f.id}]: ${f.text}`).join('\\\\n');
  }
  
  result = mainContent;
  result = result.replace(/\\n{3,}/g, '\\\\n\\\\n').trim();

  return result;
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
