// converter.js — Lightweight HTML ⇄ Markdown converter using unified/remark/rehype
// Works in both browser and Node.js environments.
// Dependencies (peer): unified, remark-parse, remark-stringify, remark-rehype,
//                      rehype-parse, rehype-stringify, rehype-remark

/* global window */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node / CommonJS
    module.exports = factory(
      require("unified"),
      require("remark-parse"),
      require("remark-stringify"),
      require("remark-rehype"),
      require("rehype-parse"),
      require("rehype-stringify"),
      require("rehype-remark")
    );
  } else {
    // Browser (UMD)
    root.converter = factory(
      root.unified,
      root.remarkParse,
      root.remarkStringify,
      root.remarkRehype,
      root.rehypeParse,
      root.rehypeStringify,
      root.rehypeRemark
    );
  }
})(typeof self !== "undefined" ? self : this, function (
  unified,
  remarkParse,
  remarkStringify,
  remarkRehype,
  rehypeParse,
  rehypeStringify,
  rehypeRemark
) {
  // Guard against missing deps
  if (!unified || !remarkParse || !remarkRehype || !rehypeRemark) {
    throw new Error(
      "Unified/remark/rehype libs must be loaded before converter.js"
    );
  }

  // ────────────────────────────────────────────────────────────
  // Processors
  // ────────────────────────────────────────────────────────────

  // Markdown ➜ HTML
  const mdToHtmlProcessor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  // HTML ➜ Markdown
  const htmlToMdProcessor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark, {
      handlers: {
        // Handle inline HTML elements by preserving them
        kbd: (h, node) => {
          return h(node, 'html', `<kbd>${node.children[0].value}</kbd>`);
        },
        del: (h, node) => {
          const value = node.children.map(child => {
            if (child.type === 'text') return child.value;
            if (child.type === 'element') return h(child);
            return '';
          }).join('');
          return h(node, 'html', `<del>${value}</del>`);
        }
      }
    })
    .use(remarkStringify, {
      bullet: "-",
      listItemIndent: "one",
      rule: "-",
      fences: true,
      emphasis: "*",
      strong: "*",
      quote: '"',
      tightDefinitions: true
    });

  /**
   * Convert Markdown to HTML
   * @param {string} markdown
   * @returns {string}
   */
  function markdownToHtml(markdown) {
    return mdToHtmlProcessor.processSync(markdown).toString();
  }

  /**
   * Convert HTML to Markdown
   * @param {string} html
   * @returns {string}
   */
  function htmlToMarkdown(html) {
    let result = htmlToMdProcessor.processSync(html).toString().trimEnd();
    
    // Fix escaped task list brackets
    result = result.replace(/- \\(\[[x ]\])/g, '- $1');
    
    // Remove extra blank lines between consecutive headers
    result = result.replace(/^(#{1,6}[^\n]*)\n\n(?=#{1,6})/gm, '$1\n');
    
    return result;
  }

  return { markdownToHtml, htmlToMarkdown };
});