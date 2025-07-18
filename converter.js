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
  showdownConverter.setFlavor('github');

  // ────────────────────────────────────────────────────────────
  // Turndown ➜ Markdown
  // ────────────────────────────────────────────────────────────
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*", 
    strongDelimiter: "**",
    linkStyle: "inlined" // Use inline style for consistent behavior
  });

  if (gfmPlugin) {
    turndownService.use(gfmPlugin);
  }

  // Custom rule for del tags - preserve certain del content as HTML, convert others to ~~
  turndownService.addRule('smartDel', {
    filter: ['del'],
    replacement: function(content, node) {
      // Heuristic: if content contains HTML-like patterns or certain keywords, preserve as HTML
      // Look for: HTML characters, entity references, or words that suggest HTML context
      const htmlPattern = /[<>&]|html|tag|element|attribute/i;
      if (htmlPattern.test(content)) {
        return '<del>' + content + '</del>';
      } else {
        return '~~' + content + '~~';
      }
    }
  });

  // Custom rule to override the default listItem rule for correct spacing and handling nested content
  turndownService.addRule('customListItem', {
    filter: 'li',
    replacement: function (content, node, options) {
      // Replace literal '\\n' sequences with actual newline characters first.
      content = content.replace(/\\n/g, '\n');

      // If the content of the list item itself starts with spaces, 
      // it might be an already-indented nested list. Avoid trimming these leading spaces.
      let isNestedListContent = content.startsWith('  '); // Heuristic: starts with 2+ spaces

      if (!isNestedListContent) {
        content = content.trim(); // Trim whitespace only if not likely a pre-indented nested list
      }
      
      // If content has internal newlines (e.g. from a nested list that Turndown processed or our \n replacement),
      // indent each line of that content. This is crucial for nested structures.
      if (content.includes('\n')) {
        // Only add indentation if it's not already correctly indented (heuristic)
        if (!isNestedListContent) {
            content = content.replace(/\n/gm, '\n    ');
        } else {
            // If it IS nested list content, it should already have its own indentation.
            // We might need to ensure the *first line* of this content is aligned with the current list item marker.
            // This part is tricky and might need more refinement based on Turndown's output for nested lists.
            // For now, let's assume the GFM plugin handles the relative indentation of nested lists correctly
            // once the literal \n are fixed.
        }
      }

      var prefix = '';
      var parent = node.parentNode;
      if (parent.nodeName === 'OL') {
        var start = parent.getAttribute('start');
        var index = Array.prototype.indexOf.call(parent.children, node);
        prefix = (start ? Number(start) + index : index + 1) + '. ';
      } else {
        prefix = options.bulletListMarker + ' ';
      }
      
      // Determine if a newline is needed after this list item
      // It's needed if it's not the last item, or if it is the last item but contains multiple lines (e.g. nested list)
      let trailingNewline = '';
      if (node.nextSibling) {
        trailingNewline = '\n';
      } else if (content.includes('\n')) {
        // If it's the last item AND it contains newlines (is a nested list/multi-line content)
        // it might not need an *additional* trailing newline if the content itself ends with one.
        // However, the standard behavior is that the list item itself provides the newline separation.
        trailingNewline = '\n'; 
      }

      return prefix + content + trailingNewline;
    }
  });

  // Minimal custom rules
  turndownService.keep(["kbd"]); // preserve <kbd> and other inline elements
  
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

    // The list item spacing and structure is now primarily handled by the 'listItem' rule.
    // These general regex cleanups for list spacing are removed as they might conflict.
    // markdown = markdown.replace(/^(\s*([*\-+])\s+)(?!\s)/gm, '$1');
    // markdown = markdown.replace(/^(\s*(\d+\.)\s+)(?!\s)/gm, '$1');
    
    return markdown;
  }

  return { markdownToHtml, htmlToMarkdown };
});