// tests/unit/isolated/md-to-html/italic.test.js
// Unit test: convert italic markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '*italic*';
const expected = '<p><em>italic</em></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: italic');
