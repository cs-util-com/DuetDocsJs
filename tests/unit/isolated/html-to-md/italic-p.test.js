// tests/unit/isolated/html-to-md/italic-p.test.js
// Unit test: convert <p><em>italic</em></p> HTML to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><em>italic</em></p>';
const expected = '*italic*';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: italic inside p');
