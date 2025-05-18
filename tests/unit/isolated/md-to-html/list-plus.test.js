// tests/unit/isolated/md-to-html/list-plus.test.js
// Unit test: convert a plus bullet list from Markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '+ Item 1\n+ Item 2';
const expected = '<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: plus bullet list');
