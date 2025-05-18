// tests/unit/isolated/md-to-html/header2.test.js
// Unit test: convert H2 Markdown header to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '## Subheader';
const expected = '<h2 id="subheader">Subheader</h2>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: H2 header');
