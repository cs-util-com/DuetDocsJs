// tests/unit/isolated/html-to-md/header6.test.js
// Unit test: convert H6 HTML header to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<h6>Level Six</h6>';
const expected = '###### Level Six';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: H6 header');
