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
            // If the child is an element, we need to get its HTML representation
            if (child.type === 'element') return h(child); // This might not be correct, rehype-remark might not have `h` in this context for stringifying arbitrary elements to HTML
            return '';
          }).join('');
          // Instead of creating a 'delete' mdast node, create an 'html' node.
          return h(node, 'html', `<del>${value}</del>`);
        },
        li: (h, node) => {
          // Handle task list items
          if (node.children.length > 0) {
            const firstChild = node.children[0];
            
            if (firstChild.type === 'element' && 
                firstChild.tagName === 'input' && 
                firstChild.properties && 
                firstChild.properties.type === 'checkbox') {
              
              // Get remaining text content
              const text = node.children
                .slice(1)
                .map(child => {
                  if (child.type === 'text') return child.value;
                  if (child.type === 'element') return h(child);
                  return '';
                })
                .join('')
                .trim();

              // Generate the markdown checkbox
              const checkbox = firstChild.properties.checked ? '[x]' : '[ ]';

              // Create a text node with the checkbox followed by text
              // No need to wrap in a paragraph, as list items can contain text directly.
              return h(node, 'listItem', {loose: false}, [h(node, 'text', checkbox + ' ' + text)]);
            }
          }

          // Handle normal list items - Create paragraph node and text nodes properly
          const children = node.children.map(child => {
            if (child.type === 'text') {
              // For normal list items, if the direct child is text, it should be wrapped in a paragraph.
              return h(node, 'paragraph', [h(node, 'text', child.value)]);
            }
            // If the child is already an element (e.g., a nested list), pass it through.
            return h(child);
          });
          
          return h(node, 'listItem', {loose: true}, children);
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
      tightDefinitions: true // Added to potentially help with list spacing
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
    return htmlToMdProcessor.processSync(html).toString().trimEnd();
  }

  return { markdownToHtml, htmlToMarkdown };
});