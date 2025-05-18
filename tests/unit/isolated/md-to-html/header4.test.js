// tests/unit/isolated/md-to-html/header4.test.js
// Unit test: convert H4 Markdown header to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '#### Fourth Level';
const expected = '<h4 id="fourth-level">Fourth Level</h4>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: H4 header');
