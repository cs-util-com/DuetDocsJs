// tests/unit/isolated/html-to-md/header2.test.js
// Unit test: convert H2 HTML header to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<h2>Subheader</h2>';
const expected = '## Subheader';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: H2 header');
