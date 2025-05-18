// tests/unit/isolated/md-to-html/list.test.js
// Unit test: convert a simple bullet list from Markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '* Item A\n* Item B';
const expected = '<ul>\n<li>Item A</li>\n<li>Item B</li>\n</ul>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: simple bullet list');
