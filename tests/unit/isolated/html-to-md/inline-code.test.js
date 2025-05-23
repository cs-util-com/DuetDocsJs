const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<p>Use <code>const example = true;</code> for inline code.</p>';
const expected = "Use `const example = true;` for inline code.";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: inline code');
