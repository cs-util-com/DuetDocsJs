// tests/unit/isolated/md-to-html/header-nospace.test.js
// Unit test: Markdown header without space should render as paragraph
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '#NoSpace';
const expected = '<p>#NoSpace</p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: header no-space');
