const fs = require('fs');
const path = require('path');
const { markdownToHtml, htmlToMarkdown } = require('../converter');

// Create a simple test for footnotes only
const footnoteMarkdown = `
Here is a footnote reference[^1].

[^1]: This is the footnote content.
`;

console.log("=== TESTING FOOTNOTE HANDLING ===");

// Test 1: Markdown to HTML
console.log("Converting markdown with footnotes to HTML...");
const html = markdownToHtml(footnoteMarkdown);
fs.writeFileSync(path.join(__dirname, 'footnote.html'), html, 'utf8');
console.log("HTML output:", html);

// Test 2: HTML back to Markdown
console.log("\nConverting HTML back to markdown...");
const roundTripMarkdown = htmlToMarkdown(html);
fs.writeFileSync(path.join(__dirname, 'footnote_roundtrip.md'), roundTripMarkdown, 'utf8');
console.log("Roundtrip markdown:", roundTripMarkdown);

// Compare the result
if (footnoteMarkdown.trim() === roundTripMarkdown.trim()) {
  console.log("\n✅ SUCCESS: Footnote roundtrip conversion preserved the syntax!");
} else {
  console.log("\n❌ FAILURE: Footnote roundtrip conversion changed the syntax.");
  console.log("\nOriginal:", footnoteMarkdown);
  console.log("\nRoundtrip:", roundTripMarkdown);
}
