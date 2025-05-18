// tests/unit/isolated/md-to-html/header3.test.js
// Unit test: convert H3 Markdown header to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '### Heading Three';
const expected = '<h3 id="heading-three">Heading Three</h3>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: H3 header');
