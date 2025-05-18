// tests/unit/isolated/html-to-md/bold-italic.test.js
// Unit test: convert bold italic HTML to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><strong><em>bold italic</em></strong></p>';
const expected = '***bold italic***';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: bold italic');
