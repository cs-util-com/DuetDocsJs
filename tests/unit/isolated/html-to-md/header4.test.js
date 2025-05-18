// tests/unit/isolated/html-to-md/header4.test.js
// Unit test: convert H4 HTML header to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<h4>Header Four</h4>';
const expected = '#### Header Four';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: H4 header');
