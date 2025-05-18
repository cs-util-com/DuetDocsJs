// tests/unit/isolated/md-to-html/header5.test.js
// Unit test: convert H5 Markdown header to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '##### Level 5';
const expected = '<h5 id="level-5">Level 5</h5>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: H5 header');
