// tests/unit/isolated/html-to-md/header3.test.js
// Unit test: convert H3 HTML header to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<h3>Heading Three</h3>';
const expected = '### Heading Three';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: H3 header');
