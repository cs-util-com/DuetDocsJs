// tests/unit/isolated/md-to-html/link-inline.test.js
// Unit test: convert inline Markdown link to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '[Example](http://example.com)';
const expected = '<p><a href="http://example.com">Example</a></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: inline link');
