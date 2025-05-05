const assert = require('assert');
const { markdownToHtml, htmlToMarkdown } = require('./converter');

// Basic test case (Corrected escaping)
const originalMarkdown = `# Heading 1

This is a paragraph with *italic* and **bold** text.

* List item 1
* List item 2

\`\`\`js
console.log("hello");
\`\`\``;

// Convert Markdown to HTML
const generatedHtml = markdownToHtml(originalMarkdown);

// Convert HTML back to Markdown
const roundtripMarkdown = htmlToMarkdown(generatedHtml);

// --- Assertions --- (Corrected escaping in messages)

// Test 1: Check if the roundtrip markdown is not empty
assert.ok(roundtripMarkdown.length > 0, 'Roundtrip Markdown should not be empty');

// Test 2: Check if the core content structure is preserved
assert.ok(roundtripMarkdown.includes('# Heading 1'), 'Heading should be present');
assert.ok(roundtripMarkdown.includes('italic'), 'Italic text should be present'); // Turndown might use _ for italic
assert.ok(roundtripMarkdown.includes('**bold**'), 'Bold text should be present');
assert.ok(roundtripMarkdown.includes('*   List item 1'), 'List item 1 should be present (with Turndown spacing)'); // Adjusted for Turndown output
assert.ok(roundtripMarkdown.includes('```js'), 'Code block fence should be present');
assert.ok(roundtripMarkdown.includes('console.log("hello")'), 'Code block content should be present');


console.log('Markdown -> HTML -> Markdown roundtrip test passed!');

// Example of how a more specific assertion might look (adjust based on actual Turndown output)
// const expectedRoundtrip = `# Heading 1\\n\\nThis is a paragraph with *italic* and **bold** text.\\n\\n*   List item 1\\n*   List item 2\\n\\n\\\`\\\`\\\`js\\nconsole.log("hello");\\n\\\`\\\`\\\``;
// assert.strictEqual(roundtripMarkdown.trim(), expectedRoundtrip.trim(), 'Roundtrip Markdown should match expected output');