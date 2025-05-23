const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<p>Text above</p>\n<hr />\n<p>Text below</p>\n<hr />\n<p>Text after stars</p>\n<hr />\n<p>Text after underscores</p>';
// Note: Turndown normalizes HR to ***
const expected = "Text above\n\n* * *\n\nText below\n\n* * *\n\nText after stars\n\n* * *\n\nText after underscores";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: horizontal rule');
