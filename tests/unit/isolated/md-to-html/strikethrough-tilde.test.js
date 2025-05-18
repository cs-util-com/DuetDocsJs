// tests/unit/isolated/md-to-html/strikethrough-tilde.test.js
// Unit test: convert Markdown strikethrough to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '~~strike~~';
const expected = '<p><del>strike</del></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: strikethrough tilde');
