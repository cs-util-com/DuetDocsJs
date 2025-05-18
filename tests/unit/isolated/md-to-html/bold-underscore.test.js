// tests/unit/isolated/md-to-html/bold-underscore.test.js
// Unit test: convert bold markdown (__bold__) to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '__bold__';
const expected = '<p><strong>bold</strong></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: bold underscore');
