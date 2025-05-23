const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "> This is a simple blockquote.";
const expected = '<blockquote>\n  <p>This is a simple blockquote.</p>\n</blockquote>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: simple blockquote');
