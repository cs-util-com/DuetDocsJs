const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<blockquote>\n  <p>Outer quote.</p>\n  <blockquote>\n    <p>Inner quote.  <br />\n    Still outer.</p>\n  </blockquote>\n</blockquote>';
const expected = "> Outer quote.\n> \n> > Inner quote.  \n> > Still outer.";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: nested blockquote');
