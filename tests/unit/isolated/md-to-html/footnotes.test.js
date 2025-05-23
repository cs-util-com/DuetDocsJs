const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "Here is a footnote reference[^1].\nAnd another one[^another].\n\n[^1]: This is the first footnote.\n[^another]: This is the **second** footnote, with markdown.";
const expected = '<p>Here is a footnote reference[^1].<br />\nAnd another one[^another].</p>\n<p>[^1]: This is the first footnote.<br />\n[^another]: This is the <strong>second</strong> footnote, with markdown.</p>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: footnotes');
