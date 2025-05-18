// tests/unit/isolated/html-to-md/italic-html-tag.test.js
// Unit test: convert <em>italic</em> HTML tag to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<em>italic</em>';
const expected = '*italic*';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: italic HTML tag');
