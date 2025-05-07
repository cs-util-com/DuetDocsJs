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
function checkForKeyElements(markdown) {
  const checks = [
    { name: 'Headers', pattern: /^# /m, expected: true },
    { name: 'Bold text', pattern: /\*\*Bold\*\*/, expected: true },
    { name: 'Italic text', pattern: /\*Italic\*/, expected: true },
    { name: 'Lists', pattern: /(^|\n)[*-] /, expected: true },
    { name: 'Ordered Lists', pattern: /(^|\n)\d+\. /, expected: true },
    { name: 'Links', pattern: /\[.*?\]\(.*?\)/, expected: true },
    { name: 'Del HTML tag', pattern: /<del>some html<\/del>/, expected: true },
    { name: 'Strikethrough', pattern: /~~Strike~~/, expected: true },
    { name: 'Code blocks', pattern: /```[\s\S]*?```/, expected: true },
    { name: 'Tables', pattern: /\|.*\|[\s\S]*?\|.*\|/, expected: true },
    { name: 'Reference link', pattern: /\[Ref link\]\[ref\]/, expected: true }
  ];
  
  const results = checks.map(check => {
    const result = check.pattern.test(markdown);
    return {
      name: check.name,
      pass: result === check.expected,
      found: result
    };
  });
  
  return results;
}

const checkResults = checkForKeyElements(roundtripMarkdown);

// Display results
console.log("Key element preservation check:");
let allPassed = true;
checkResults.forEach(result => {
  if (result.pass) {
    console.log(`✓ ${result.name}`);
  } else {
    allPassed = false;
    console.log(`✗ ${result.name} - ${result.found ? 'Unexpectedly found' : 'Not found'}`);
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