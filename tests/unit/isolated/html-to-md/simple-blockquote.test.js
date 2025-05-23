const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<blockquote>\n  <p>This is a simple blockquote.</p>\n</blockquote>';
const expected = "> This is a simple blockquote.";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: simple blockquote');
