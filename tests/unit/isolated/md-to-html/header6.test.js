// tests/unit/isolated/md-to-html/header6.test.js
// Unit test: convert H6 Markdown header to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '###### Deepest Level';
const expected = '<h6 id="deepest-level">Deepest Level</h6>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: H6 header');
