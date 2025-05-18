// tests/unit/isolated/html-to-md/strikethrough-del.test.js
// Unit test: convert <del> HTML tag to Markdown strikethrough
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><del>strike</del></p>';
const expected = '~~strike~~';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: strikethrough <del>');
