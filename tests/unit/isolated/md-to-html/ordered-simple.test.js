// tests/unit/isolated/md-to-html/ordered-simple.test.js
// Unit test: convert a simple ordered list from Markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '1. First\n2. Second';
const expected = '<ol>\n<li>First</li>\n<li>Second</li>\n</ol>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: simple ordered list');
