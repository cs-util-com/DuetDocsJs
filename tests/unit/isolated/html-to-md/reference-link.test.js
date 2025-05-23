const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><a href="https://example.com" title="Optional Title">My Site</a></p>';
const expected = "[My Site][1]\n\n[1]: https://example.com \"Optional Title\"";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: reference link');
