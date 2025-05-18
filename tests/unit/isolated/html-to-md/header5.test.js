// tests/unit/isolated/html-to-md/header5.test.js
// Unit test: convert H5 HTML header to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<h5>Level 5</h5>';
const expected = '##### Level 5';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: H5 header');
