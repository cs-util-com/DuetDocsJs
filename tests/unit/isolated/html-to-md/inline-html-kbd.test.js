const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>';
const expected = "Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: inline HTML kbd');
