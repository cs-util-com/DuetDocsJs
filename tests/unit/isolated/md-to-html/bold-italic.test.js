// tests/unit/isolated/md-to-html/bold-italic.test.js
// Unit test: convert bold italic markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '***bold italic***';
const expected = '<p><strong><em>bold italic</em></strong></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: bold italic');
