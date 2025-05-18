// tests/unit/isolated/html-to-md/header1.test.js
// Unit test: convert H1 HTML header to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<h1>Header One</h1>';
const expected = '# Header One';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: H1 header');
