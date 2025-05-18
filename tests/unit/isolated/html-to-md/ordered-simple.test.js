// tests/unit/isolated/html-to-md/ordered-simple.test.js
// Unit test: convert a simple ordered list from HTML to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<ol><li>First</li><li>Second</li></ol>';
const expected = '1. First\n2. Second';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: simple ordered list');
