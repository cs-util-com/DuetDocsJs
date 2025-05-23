const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p>Use <code>const example = true;</code> for inline code.</p>';
const expected = "Use `const example = true;` for inline code.";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: inline code');
