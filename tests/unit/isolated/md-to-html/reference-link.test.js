const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "[My Site][site-ref]\n\n[site-ref]: https://example.com \"Optional Title\"";
const expected = '<p><a href="https://example.com" title="Optional Title">My Site</a></p>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: reference link');
