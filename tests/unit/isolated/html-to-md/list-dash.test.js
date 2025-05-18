// tests/unit/isolated/html-to-md/list-dash.test.js
// Unit test: convert a dash markdown list from HTML to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
const expected = '* Item 1\n* Item 2';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: dash bullet list');
