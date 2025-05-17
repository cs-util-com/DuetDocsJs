// converter.js — Lightweight HTML ⇄ Markdown converter
// Works in both browser and Node.js environments.
// Dependencies: showdown, turndown, turndown-plugin-gfm

/* global window */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node / CommonJS
    module.exports = factory(
      require("showdown"),
      require("turndown"),
      require("turndown-plugin-gfm").gfm
    );
  } else {
    // Browser (UMD)
    root.converter = factory(
      root.showdown,
      root.TurndownService,
      root.turndownPluginGfm && root.turndownPluginGfm.gfm
    );
  }
})(typeof self !== "undefined" ? self : this, function (
  Showdown,
  TurndownService,
  gfmPlugin
) {
  if (!Showdown || !TurndownService) {
    throw new Error("Showdown and Turndown must be loaded before converter.js");
  }

  // ────────────────────────────────────────────────────────────
  // Showdown ➜ HTML
  // ────────────────────────────────────────────────────────────
  const showdownConverter = new Showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    ghCodeBlocks: true,
    parseImgDimensions: true,
    ghCompatibleHeaderId: true,
    requireSpaceBeforeHeadingText: true,
    tablesHeaderId: true, // Potentially helpful for table processing
    simpleLineBreaks: false, // To better match standard GFM line breaks
    footnotes: true, // Enable footnotes support
    ghMentions: false, // Prevent @mention linking
    keepReferences: true // Attempt to preserve reference-style links/images
  });
  showdownConverter.setFlavor("github");
  showdownConverter.setOption('ghMentions', false); // Ensure ghMentions is off after setting flavor
  showdownConverter.setOption('tableDelimiter', '|'); // Explicitly set for clarity

  // Enable Showdown extension for table compatibility if available or needed
  // Showdown.extension('tableCompat', () => { ... });
  // showdownConverter.useExtension('tableCompat');

  // ────────────────────────────────────────────────────────────
  // Turndown ➜ Markdown
  // ────────────────────────────────────────────────────────────
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "*",
    codeBlockStyle: "fenced",
    emDelimiter: "*", // Consistent with one of the original markdown styles
    strongDelimiter: "**", // Consistent with one of the original markdown styles
  });

  if (gfmPlugin) {
    turndownService.use(gfmPlugin);  }

  // Custom rule to override the default listItem rule for correct spacing
  turndownService.addRule('customListItem', {
    filter: 'li',
    replacement: function (content, node, options) {
      content = content
        .replace(/^\\n+/, '')      // Remove leading newlines
        .replace(/\\n+$/, '\\n')    // Ensure a single trailing newline if content had newlines
        .replace(/\\n/gm, '\\n    '); // Indent content with newlines (e.g., nested lists)

      var prefix = '';
      var parent = node.parentNode;
      if (parent.nodeName === 'OL') {
        var start = parent.getAttribute('start');
        var index = Array.prototype.indexOf.call(parent.children, node);
        prefix = (start ? Number(start) + index : index + 1) + '. '; // Number, dot, one space
      } else {
        prefix = options.bulletListMarker + ' '; // Bullet marker, one space
      }
      return (
        prefix + content + (node.nextSibling && !/\\n$/.test(content) ? '\\n' : '')
      );
    }
  });

  // Minimal custom rules (keep kbd, del)
  turndownService.keep(["kbd"]); 
  turndownService.addRule("del", {
    filter: ["del", "s", "strike"],
    replacement: (content) => `~~${content}~~`,
  });
  
  // Enhance table handling to preserve alignment
  turndownService.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: function(content, node) {
      // Cell content should be trimmed.
      // The GFM plugin and other rules might add spaces, so we trim here.
      const trimmedContent = content.trim();
      const align = node.style.textAlign || getComputedStyle(node).textAlign;
      
      if (align === 'center') {
        // Add equal padding on both sides for centered content
        return ' ' + trimmedContent + ' ';
      } else if (align === 'right') {
        // Add more padding on the left for right-aligned content
        return '    ' + trimmedContent + ' ';
      } else {
        // Default (left alignment) - add more padding on the right
        return ' ' + trimmedContent + '    ';
      }
    }
  });
  
  // Custom rule for tables with alignment
  turndownService.addRule('tableWithAlignment', {
    filter: 'table',
    replacement: function (content, node) {
      if (!content.trim()) {
        return '';
      }

      const headers = Array.from(node.querySelectorAll('thead th'));
      let headerLine = '';
      let alignmentRow = '';

      if (headers.length > 0) {
        headerLine = '| ' + headers.map(th => th.textContent.trim()).join(' | ') + ' |';
        
        alignmentRow = '|';
        for (const header of headers) {
          const align = header.style.textAlign || getComputedStyle(header).textAlign;
          let marker;
          switch (align) {
            case 'left':  marker = ' :--- '; break;
            case 'center':marker = ' :----: '; break;
            case 'right': marker = ' ----: '; break;
            default:      marker = ' --- '; break; 
          }
          alignmentRow += marker + '|';
        }
      }

      let bodyLines = [];
      const rows = Array.from(node.querySelectorAll('tbody tr'));
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const rowLine = '| ' + cells.map((cell, idx) => {
          const content = cell.textContent.trim();
          const align = cell.style.textAlign || getComputedStyle(cell).textAlign;
          
          // Apply padding based on alignment
          if (align === 'center') {
            const totalWidth = headers[idx] ? headers[idx].textContent.trim().length : content.length;
            const padding = Math.max(totalWidth - content.length, 0);
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return ' '.repeat(leftPad) + content + ' '.repeat(rightPad);
          } else if (align === 'right') {
            const totalWidth = headers[idx] ? headers[idx].textContent.trim().length : content.length;
            const padding = Math.max(totalWidth - content.length, 0);
            return ' '.repeat(padding) + content;
          } else { // left alignment
            return content + ' '.repeat(4); // Add some padding on right for left-aligned
          }
        }).join(' | ') + ' |';
        bodyLines.push(rowLine);
      });
      
      if (!headerLine && rows.length > 0) { // Handle tables without <thead>
        const firstRowCells = Array.from(rows[0].querySelectorAll('td'));
        if (firstRowCells.length > 0) {
            headerLine = '| ' + firstRowCells.map(cell => cell.textContent.trim()).join(' | ') + ' |';
            alignmentRow = '| ' + firstRowCells.map(() => '---').join(' | ') + ' |';
            bodyLines.shift(); 
        } else {
            return ''; 
        }
      } else if (!headerLine && rows.length === 0) {
        return '';
      }

      return headerLine + '\n' + alignmentRow + (bodyLines.length > 0 ? '\n' + bodyLines.join('\n') : '');
    }
  });

  // Custom rule for footnote references
  turndownService.addRule('footnoteRef', {
    filter: (node) => {
      // Showdown typically wraps footnote refs in <sup><a>...</a></sup>
      // The <a> tag has href like #fn-footnoteId and rel="footnote"
      // The content of the <a> is the number/identifier.
      if (node.nodeName === 'A' && node.getAttribute('rel') === 'footnote') {
        const href = node.getAttribute('href');
        if (href && href.startsWith('#fn-')) {
          return true;
        }
      }
      return false;
    },
    replacement: (content, node) => {
      const href = node.getAttribute('href');
      const footnoteId = href.substring(4); // Remove #fn-
      return `[^${footnoteId}]`;
    }
  });

  // Custom rule for footnote definitions
  // Showdown output: <div class="footnotes"><hr><ol><li id="fn-1"><p>Footnote content. <a href="#fnref-1" rev="footnote">&#8617;</a></p></li></ol></div>
  turndownService.addRule('footnoteDefinition', {
    filter: (node) => {
      return node.nodeName === 'LI' && node.id && node.id.startsWith('fn-');
    },
    replacement: (content, node) => {
      const id = node.id.substring(3); // Remove fn-

      // Clone the node to safely remove the backlink before processing content
      const clonedNode = node.cloneNode(true);
      const backlink = clonedNode.querySelector('a[rev="footnote"]');
      if (backlink) {
        backlink.parentNode.removeChild(backlink);
      }

      // Turndown the inner HTML of the cloned node (which should be the footnote's content)
      // Trim whitespace, especially if content was wrapped in <p> by Showdown
      let footnoteText = turndownService.turndown(clonedNode.innerHTML).trim();
      
      // Showdown might add an extra paragraph inside the <li>. If so, turndown might produce
      // text with leading/trailing newlines from that paragraph.
      // A common pattern is <p>content</p> inside <li>.
      // If the footnoteText itself contains block elements that turndown converts with newlines,
      // those should be preserved. The .trim() above handles outer newlines.

      return `[^${id}]: ${footnoteText}\n`; // Ensure a newline after the definition, use actual newline, not escaped
    }
  });

    /**
   * Convert Markdown to HTML
   * @param {string} markdown
   * @returns {string}
   */
  function markdownToHtml(markdown) {
    return showdownConverter.makeHtml(markdown);
  }

  /**
   * Convert HTML to Markdown
   * @param {string} html
   * @returns {string}
   */
  function htmlToMarkdown(html) {
    let markdown = turndownService.turndown(html);
    
    // Look for footnote patterns that would be escaped by Turndown and fix them
    // Fix footnote references [^id]
    markdown = markdown.replace(/\\\[\^([\w\d-]+)\\\]/g, '[^$1]');
    
    // Fix footnote definitions [^id]:
    markdown = markdown.replace(/\\\[\^([\w\d-]+)\\\]:/g, '[^$1]:');
    
    // Fix inline footnote references that may contain spaces [^note text]
    markdown = markdown.replace(/\\\[\^([^\]]+)\\\]/g, '[^$1]');

    // The list item spacing is now handled by the custom 'customListItem' rule,
    // so these regex replacements are no longer needed.
    // markdown = markdown.replace(/^(\s*([*\-+])\s+)(?!\s)/gm, '$1');
    // markdown = markdown.replace(/^(\s*(\d+\.)\s+)(?!\s)/gm, '$1'); 
    
    return markdown;
  }

  return { markdownToHtml, htmlToMarkdown };
});