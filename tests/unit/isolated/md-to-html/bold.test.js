// tests/unit/isolated/md-to-html/bold.test.js
// Unit test: convert bold markdown to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '**bold**';
const expected = '<p><strong>bold</strong></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: bold');
