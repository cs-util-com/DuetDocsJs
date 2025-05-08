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
  // Define expected structures from originalMarkdown for stricter checking
  const expectedOrderedListBlock = `\
1. Ordered   
   1. Sub ordered 1
   1. Sub ordered 2   
2. Another
   * Sub unordered
     1. Sub ordered 1
     1. Sub ordered 2`;

  const expectedBulletListBlock = `\
* Bullet
* Bullet
- Also Bullet
- Also Bullet`; // Note: Turndown is expected to convert '-' to '*' for consistency.
                           // So the actual check will be for '*'

  const expectedTaskListBlock = `\
* [ ] Task Open 
* [x] Task Done`;

  const expectedTableBlock = `\
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |    b   |     c |
| d    |    e   |     f |`;

  const expectedFencedCodeBlock = `\
\`\`\`js
console.log('Hi');
\`\`\``;

  const expectedBlockquoteBlock = `\
> Quote
> 
> > Nested`;

  // Helper to create a regex from a multiline string, escaping special chars
  // and making whitespace flexible (to a degree) but structure rigid.
  const createBlockRegex = (blockString) => {
    const escaped = blockString.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'); // Escape regex special chars
    // Replace multiple spaces/tabs with \\s+ for flexibility in spacing within lines,
    // but preserve newlines strictly.
    const regexStr = escaped.replace(/ +/g, '\\\\s+');
    return new RegExp(regexStr.replace(/\\\n/g, '\\n')); // Ensure newlines are literal
  };
  
  const createExactBlockRegex = (blockString) => {
    // Characters that are special in regular expressions
    const metaCharsRegex = /[\\^$.*+?()[\]{}|]/g;
    // Define a literal backslash string. In JS, '\\' becomes a single backslash.
    const literalBackslash = '\\\\'; 
    // The replacement string should be a literal backslash followed by the matched substring ($&).
    const regexSafeReplacement = literalBackslash + '$&';

    // Escape special regex characters
    let escaped = blockString.replace(metaCharsRegex, regexSafeReplacement);
    
    // Normalize line endings to \n for the regex pattern string
    escaped = escaped.replace(/\r\n|\r|\n/g, '\\n');
    
    // Make spaces flexible (allow zero or more whitespace characters for every space)
    escaped = escaped.replace(/ /g, '\\s*'); 
    
    return new RegExp(escaped, 'm'); // 'm' for multiline matching
  };


  const checks = [
    // General Structure & Headers
    { name: 'H1 Header', expected: "# Markdown Examples", actual: roundtripMd.includes("# Markdown Examples") },
    { name: 'H6 Header', expected: "###### Header 6", actual: roundtripMd.includes("###### Header 6") },

    // Rich Text
    { name: 'Bold text', expected: "**Bold**", actual: roundtripMd.includes("**Bold**") },
    { name: 'Italic text', expected: "*Italic*", actual: roundtripMd.includes("*Italic*") },
    { name: 'Strikethrough', expected: "~~Strike~~", actual: roundtripMd.includes("~~Strike~~") },
    { name: 'Del HTML tag', expected: "<del>some html</del>", actual: roundtripMd.includes("<del>some html</del>") },
    
    // Lists - Stricter block checks
    { 
      name: 'Ordered List Structure', 
      expected: expectedOrderedListBlock, 
      actual: createExactBlockRegex(expectedOrderedListBlock).test(roundtripMd),
      info: "Checks for exact ordered list block, including nesting and mixed types."
    },
    { 
      name: 'Bullet List Structure', 
      expected: expectedBulletListBlock.replace(/- Also Bullet/g, '* Also Bullet'), // Test expects '-' to be converted to '*'
      actual: createExactBlockRegex(expectedBulletListBlock.replace(/- Also Bullet/g, '* Also Bullet')).test(roundtripMd),
      info: "Checks for bullet list block. Note: '-' items are expected to be converted to '*'."
    },
    { 
      name: 'Task List Structure', 
      expected: expectedTaskListBlock, 
      actual: createExactBlockRegex(expectedTaskListBlock).test(roundtripMd),
      info: "Checks for task list block with correct markers."
    },

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
    { 
      name: 'Fenced Code Block with lang ID', 
      expected: expectedFencedCodeBlock, 
      actual: createExactBlockRegex(expectedFencedCodeBlock).test(roundtripMd),
      info: "Checks for the exact fenced code block."
    },
    
    // Tables
    { 
      name: 'Table Structure', 
      expected: expectedTableBlock, 
      actual: createExactBlockRegex(expectedTableBlock).test(roundtripMd),
      info: "Checks for the exact table structure, including alignment and spacing."
    },

    // Blockquotes
    { 
      name: 'Blockquote Structure', 
      expected: expectedBlockquoteBlock, 
      actual: createExactBlockRegex(expectedBlockquoteBlock).test(roundtripMd),
      info: "Checks for exact blockquote structure, including nesting."
    },
    
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