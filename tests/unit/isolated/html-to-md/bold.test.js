// tests/unit/isolated/html-to-md/bold.test.js
// Unit test: convert bold HTML (<strong>) to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><strong>bold</strong></p>';
const expected = '**bold**';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: bold');
