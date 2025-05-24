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
  });
  showdownConverter.setFlavor("github");

  // ────────────────────────────────────────────────────────────
  // Turndown ➜ Markdown
  // ────────────────────────────────────────────────────────────
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "*",
    codeBlockStyle: "fenced",
  });

  if (gfmPlugin) turndownService.use(gfmPlugin);

  // Minimal custom rules
  turndownService.keep(["kbd"]); // preserve <kbd>
  turndownService.addRule("del", {
    filter: ["del", "s", "strike"],
    replacement: (content) => `~~${content}~~`,
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