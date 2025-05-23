const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "Text above\n\n---\n\nText below\n\n***\n\nText after stars\n\n___\n\nText after underscores";
const expected = '<p>Text above</p>\n<hr />\n<p>Text below</p>\n<hr />\n<p>Text after stars</p>\n<hr />\n<p>Text after underscores</p>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: horizontal rule');
