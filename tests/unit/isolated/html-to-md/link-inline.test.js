// tests/unit/isolated/html-to-md/link-inline.test.js
// Unit test: convert inline HTML link to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<a href="http://example.com">Example</a>';
const expected = '[Example][1]\n\n[1]: http://example.com';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: inline link');
