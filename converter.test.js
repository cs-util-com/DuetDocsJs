const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { markdownToHtml, htmlToMarkdown } = require('./converter');

// Read the example markdown file
const exampleMdPath = path.join(__dirname, 'example markdown.md');
const originalMarkdown = fs.readFileSync(exampleMdPath, 'utf8');

// Convert Markdown to HTML
const generatedHtml = markdownToHtml(originalMarkdown);

// Convert HTML back to Markdown
const roundtripMarkdown = htmlToMarkdown(generatedHtml);

// --- Normalization ---
// Normalize newlines (replace multiple newlines with a single one, and trim leading/trailing newlines)
// Also, trim whitespace from each line to handle minor indentation differences.
const normalizeMarkdown = (md) => {
  if (typeof md !== 'string') return '';
  return md
    .split('\n')
    .map(line => {
      // For task list items, preserve a bit more structure before general trimming
      if (line.match(/^\s*(\*|-)\s+\[[ xX]\]/)) {
        // Normalize to "* [x] text" or "* [ ] text"
        return line.replace(/^\s*(\*|-)\s+\[([xX ])\]\s*/, '* [$2] ').trimRight();
      }
      return line.trim();
    })
    .filter(line => line.length > 0) // Remove empty lines that were just whitespace
    .join('\n') // Join back with single newlines
    // .replace(/\n{2,}/g, '\n') // Replace 2 or more newlines with a single one
    .trim();
};

const normalizedOriginalMarkdown = normalizeMarkdown(originalMarkdown);
const normalizedRoundtripMarkdown = normalizeMarkdown(roundtripMarkdown);

// --- Assertion ---
// Check if the roundtrip markdown strictly matches the original after trimming whitespace
// Note: Perfect round-tripping can be difficult due to library differences.
// This assertion might need adjustments if minor normalization differences occur.
assert.strictEqual(
  normalizedRoundtripMarkdown,
  normalizedOriginalMarkdown,
  'Roundtrip Markdown should strictly match the original example file (after normalization)'
);

console.log('Markdown -> HTML -> Markdown roundtrip test using example markdown.md passed!');