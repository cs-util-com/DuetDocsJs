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
    // Stricter checks for list structures, indentation, and types.
    { name: 'Ordered List Item 1', expected: "1. Ordered", actual: /^1\\.\\s+Ordered/m.test(roundtripMd) },
    { name: 'Ordered List - Nested Item 1.1', info: "Checks for '1. Ordered' followed by indented '1. Sub ordered 1'", expected: "1. Ordered\\n   1. Sub ordered 1", actual: /1\.\\s+Ordered\\s*\n\s+1\.\\s+Sub ordered 1/m.test(roundtripMd) },
    { name: 'Ordered List - Nested Item 1.2', info: "Checks for indented '2. Sub ordered 2' following previous nested item", expected: "   1. Sub ordered 2", actual: /\s+2\.\\s+Sub ordered 2/m.test(roundtripMd) }, // Note: Original is "1. Sub ordered 2", roundtrip might renumber. This check is for structure.
    { name: 'Ordered List - Item 2 (Another)', expected: "2. Another", actual: /^2\.\\s+Another/m.test(roundtripMd) },
    { name: 'Ordered List - Mixed Nested Unordered', info: "Checks for '2. Another' followed by indented '* Sub unordered'", expected: "2. Another\\n   * Sub unordered", actual: /2\.\\s+Another\s*\n\s+\*\s+Sub unordered/m.test(roundtripMd) },
    { name: 'Bullet List Item (Asterisk)', expected: "* Bullet", actual: /^\\*\\s+Bullet/m.test(roundtripMd) },
    { name: 'Bullet List Item (Hyphen to Asterisk)', info: "Original had '- Also Bullet', expecting '* Also Bullet'", expected: "* Also Bullet", actual: /^\\*\\s+Also Bullet/m.test(roundtripMd) },
    { name: 'Task List Open', expected: "* [ ] Task Open", actual: /^\\*\\s+\[ \]\s+Task Open/m.test(roundtripMd) }, 
    { name: 'Task List Done', expected: "* [x] Task Done", actual: /^\\*\\s+\[x\]\s+Task Done/m.test(roundtripMd) },

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
    { name: 'Fenced Code Block with lang ID', expected: "```js\\nconsole.log('Hi');\\n```", actual: roundtripMd.includes("```js\\nconsole.log('Hi');\\n```") },
    
    // Tables
    // Stricter checks for table structure, including alignment and original spacing.
    { name: 'Table Header Row', expected: "| Left | Center | Right |", actual: roundtripMd.includes("| Left | Center | Right |") }, // Keep as is, but next one is stricter
    { name: 'Table Separator Row with Alignment', expected: "| :--- | :----: | ----: |", info: "Checks for original alignment markers.", actual: roundtripMd.includes("| :--- | :----: | ----: |") },
    { name: 'Table Body Row 1 (Original Spacing)', expected: "| a    |    b   |     c |", info: "Checks for original cell spacing.", actual: roundtripMd.includes("| a    |    b   |     c |") },
    { name: 'Table Body Row 2 (Original Spacing)', expected: "| d    |    e   |     f |", info: "Checks for original cell spacing.", actual: roundtripMd.includes("| d    |    e   |     f |") },

    // Blockquotes
    { name: 'Blockquote', expected: "> Quote", actual: roundtripMd.includes("> Quote") },
    { name: 'Nested Blockquote', expected: "> > Nested", actual: roundtripMd.includes("> > Nested") },
    
    // Inline HTML
    { name: 'KBD tag', expected: "<kbd>Ctrl</kbd> + <kbd>C</kbd>", actual: roundtripMd.includes("<kbd>Ctrl</kbd> + <kbd>C</kbd>") }
  ];
  
  const results = checks.map(check => {
    // If 'actual' is already a boolean (from includes or test()), use it directly.
    const pass = typeof check.actual === 'boolean' ? check.actual : false; // Default to false if check.actual wasn't a boolean
    return {
      name: check.name,
      pass: pass,
      expectedValue: check.expected,
      // For regex, 'found' might not be as simple as for 'includes'.
      // We'll rely on the 'pass' status.
      found: pass ? "Found as expected" : "Not found or mismatched",
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