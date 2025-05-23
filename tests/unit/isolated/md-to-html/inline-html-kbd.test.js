const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.";
const expected = '<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: inline HTML kbd');
