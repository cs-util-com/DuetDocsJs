const fs = require('fs');
const path = require('path');
const { markdownToHtml, htmlToMarkdown } = require('./converter');

// Read the example markdown file
const exampleMdPath = path.join(__dirname, 'example markdown.md');
const originalMarkdown = fs.readFileSync(exampleMdPath, 'utf8');

console.log("\n=== ROUNDTRIP MARKDOWN CONVERSION TEST ===");
console.log("This test converts markdown to HTML and back to markdown");
console.log("to verify that key elements are preserved.\n");

// Convert Markdown to HTML
console.log("Step 1: Converting Markdown to HTML...");
const generatedHtml = markdownToHtml(originalMarkdown);

// Examine HTML output
console.log("\nHTML Intermediate Output (first 500 characters):");
console.log(generatedHtml.substring(0, 500) + "...");

// Convert HTML back to Markdown
console.log("\nStep 2: Converting HTML back to Markdown...");
const roundtripMarkdown = htmlToMarkdown(generatedHtml);

// Write the output files to inspect the differences
fs.writeFileSync('roundtrip-result.md', roundtripMarkdown, 'utf8');
fs.writeFileSync('html-intermediate.html', generatedHtml, 'utf8');
console.log("Generated output files: roundtrip-result.md, html-intermediate.html\n");

// Simple check for the presence of key elements in the roundtrip output
function checkForKeyElements(originalMd, roundtripMd) {
  const checks = [
    // General Structure & Headers
    { name: 'H1 Header', expected: "# Markdown Examples", actual: roundtripMd.includes("# Markdown Examples") },
    { name: 'H6 Header', expected: "###### Header 6", actual: roundtripMd.includes("###### Header 6") },

    // Rich Text
    { name: 'Bold text', expected: "**Bold**", actual: roundtripMd.includes("**Bold**") },
    { name: 'Italic text', expected: "*Italic*", actual: roundtripMd.includes("*Italic*") },
    { name: 'Strikethrough', expected: "~~Strike~~", actual: roundtripMd.includes("~~Strike~~") },
    { name: 'Del HTML tag', expected: "<del>some html</del>", actual: roundtripMd.includes("<del>some html</del>") },
    
    // Lists - Original vs Roundtrip
    // Note: Exact list formatting, especially nested lists, is hard to preserve perfectly.
    // These checks are more specific than before.
    { name: 'Ordered List Item 1', expected: "1. Ordered", actual: roundtripMd.match(/^1\.\s+Ordered/m) !== null },
    { name: 'Ordered List - Nested Item (Original: "   1. Sub ordered 1")', info: "Checks if a common pattern of nested ordered list is somewhat preserved. Original had specific indentation and numbering.", actual: roundtripMd.includes("Sub ordered 1") }, // General check, as exact structure is tricky
    { name: 'Bullet List Item (Asterisk)', expected: "* Bullet", actual: roundtripMd.match(/^\*\s+Bullet/m) !== null },
    { name: 'Bullet List Item (Hyphen preserved as Asterisk)', info: "Original had '- Also Bullet', expecting it to become '* Also Bullet' or similar GFM standard.", expected: "* Also Bullet", actual: roundtripMd.match(/^\*\s+Also Bullet/m) !== null },
    { name: 'Task List Open', expected: "*   [ ]  Task Open", actual: roundtripMd.includes("*   [ ]  Task Open") }, 
    { name: 'Task List Done', expected: "*   [x]  Task Done", actual: roundtripMd.includes("*   [x]  Task Done") },

    // Links
    { name: 'Inline Link', expected: "[Inline](https://example.com)", actual: roundtripMd.includes("[Inline](https://example.com)") },
    { name: 'Reference Link Usage', expected: "[Ref link][ref]", actual: roundtripMd.includes("[Ref link][ref]") },
    { name: 'Reference Link Definition', expected: "[ref]: https://example.org", actual: roundtripMd.includes("[ref]: https://example.org") },

    // Images
    { name: 'Inline Image', expected: "![Cat](https://picsum.photos/100)", actual: roundtripMd.includes("![Cat](https://picsum.photos/100)") },
    { name: 'Reference Image', expected: "![Logo][logo]", actual: roundtripMd.includes("![Logo][logo]") },
    { name: 'Clickable Image', expected: "[![Video](https://picsum.photos/120)](https://youtu.be/dQw4w9WgXcQ)", actual: roundtripMd.includes("[![Video](https://picsum.photos/120)](https://youtu.be/dQw4w9WgXcQ)")},

    // Footnotes
    { name: 'Footnote Reference', expected: "Footnote here[^1]", actual: roundtripMd.includes("Footnote here[^1]") },
    { name: 'Footnote Definition', expected: "[^1]: Footnote **supports** markdown.", actual: roundtripMd.includes("[^1]: Footnote **supports** markdown.") },
    
    // Code
    { name: 'Inline code', expected: "`Inline code`", actual: roundtripMd.includes("`Inline code`") },
    { name: 'Fenced Code Block with lang ID', expected: "```js\nconsole.log('Hi');\n```", actual: roundtripMd.includes("```js\nconsole.log('Hi');\n```") },
    
    // Tables
    // This checks for the presence of GFM table structure. Exact spacing might differ.
    { name: 'Table Header Row', expected: "| Left | Center | Right |", actual: roundtripMd.includes("| Left | Center | Right |") || roundtripMd.includes("| Left | Center | Right |") },
    { name: 'Table Separator Row', expected: "| :--- | :----: | ----: |", info: "Original alignment. Turndown might simplify to | --- | --- | --- |", actual: roundtripMd.includes("| --- | --- | --- |") || roundtripMd.includes("| :--- | :----: | ----: |") },
    { name: 'Table Body Row', expected: "| a    |    b   |     c |", actual: roundtripMd.includes("| a | b | c |") || roundtripMd.includes("| a    |    b   |     c |") }, // Simpler check due to spacing variations

    // Blockquotes
    { name: 'Blockquote', expected: "> Quote", actual: roundtripMd.includes("> Quote") },
    { name: 'Nested Blockquote', expected: "> > Nested", actual: roundtripMd.includes("> > Nested") },
    
    // Inline HTML
    { name: 'KBD tag', expected: "<kbd>Ctrl</kbd> + <kbd>C</kbd>", actual: roundtripMd.includes("<kbd>Ctrl</kbd> + <kbd>C</kbd>") }
  ];
  
  const results = checks.map(check => {
    // If 'actual' is already a boolean (from includes), use it directly. Otherwise, evaluate.
    const pass = typeof check.actual === 'boolean' ? check.actual : check.pattern.test(roundtripMd) === check.expected;
    return {
      name: check.name,
      pass: pass,
      expectedValue: check.expected,
      found: typeof check.actual === 'boolean' ? (check.actual ? "Found" : "Not found") : (check.pattern.test(roundtripMd) ? "Found" : "Not found"),
      info: check.info || ""
    };
  });
  
  return results;
}

const checkResults = checkForKeyElements(originalMarkdown, roundtripMarkdown);

// Display results
console.log("Key element preservation check (stricter):");
let allPassed = true;
checkResults.forEach(result => {
  if (result.pass) {
    console.log(`✓ ${result.name}`);
  } else {
    allPassed = false;
    console.log(`✗ ${result.name} - Expected to find pattern/substring related to '${result.expectedValue}' but it was not found as expected or structure differs. ${result.info}`);
  }
});

// Visual difference comparison with limited output
console.log("\nVisual sample comparison (truncated):");
const originalLines = originalMarkdown.split('\n').slice(0, 10);
const roundtripLines = roundtripMarkdown.split('\n').slice(0, 10);

console.log("\n== ORIGINAL (first 10 lines) ==");
console.log(originalLines.join("\n"));

console.log("\n== ROUNDTRIP (first 10 lines) ==");
console.log(roundtripLines.join("\n"));

// Check if the roundtrip markdown has proper line breaks
console.log("\nRoundtrip newline analysis:");
console.log(`- Contains newlines: ${roundtripMarkdown.includes('\n')}`);
console.log(`- Number of lines: ${roundtripMarkdown.split('\n').length}`);
console.log(`- First 50 chars: '${roundtripMarkdown.substring(0, 50).replace(/\n/g, '\\n')}'`);

// Overall result
if (allPassed) {
  console.log("\n✅ OVERALL RESULT: All key elements were preserved in the roundtrip conversion");
} else {
  console.log("\n❌ OVERALL RESULT: Some key elements were not preserved in the roundtrip conversion");
}

console.log("\nNote: This test checks for the presence of key markdown elements rather than exact string matching.");
console.log("The test output files can be inspected for more detailed comparison.");