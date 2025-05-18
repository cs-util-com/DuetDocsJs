// tests/unit/isolated/md-to-html/header1.test.js
// Unit test: convert H1 Markdown header to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '# Header One';
const expected = '<h1 id="header-one">Header One</h1>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: H1 header');
