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
    simpleLineBreaks: false // To better match standard GFM line breaks
  });
  showdownConverter.setFlavor("github");
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
    turndownService.use(gfmPlugin); // Apply GFM plugin which includes table support
  }

  // Minimal custom rules
  turndownService.keep(["kbd"]); // preserve <kbd>
  turndownService.addRule("del", {
    filter: ["del", "s", "strike"],
    replacement: (content) => `~~${content}~~`,
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

      return `[^${id}]: ${footnoteText}\\n`; // Ensure a newline after the definition
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
    return turndownService.turndown(html);
  }

  return { markdownToHtml, htmlToMarkdown };
});