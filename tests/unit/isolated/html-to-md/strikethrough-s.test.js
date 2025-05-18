// tests/unit/isolated/html-to-md/strikethrough-s.test.js
// Unit test: convert <s> HTML tag to Markdown strikethrough
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><s>strike</s></p>';
const expected = '~~strike~~';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: strikethrough <s>');
