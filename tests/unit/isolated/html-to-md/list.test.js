// tests/unit/isolated/html-to-md/list.test.js
// Unit test: convert a simple bullet list from HTML to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<ul><li>Item A</li><li>Item B</li></ul>';
const expected = '* Item A\n* Item B';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: simple bullet list');
