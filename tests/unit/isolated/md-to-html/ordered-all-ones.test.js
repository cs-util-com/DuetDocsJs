// tests/unit/isolated/md-to-html/ordered-all-ones.test.js
// Unit test: convert ordered list with all 1s from Markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '1. First\n1. Second';
const expected = '<ol>\n<li>First</li>\n<li>Second</li>\n</ol>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: ordered list all ones');
