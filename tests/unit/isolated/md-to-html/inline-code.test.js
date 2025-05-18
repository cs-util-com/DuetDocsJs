// tests/unit/isolated/md-to-html/inline-code.test.js
// Unit test: convert inline code markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '`InlineCode`';
const expected = '<p><code>InlineCode</code></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: inline code');
