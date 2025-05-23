const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<p><a href="https://example.com" title="Optional Title">My Site</a></p>';
const expected = "[My Site](https://example.com \"Optional Title\")";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: reference link');
