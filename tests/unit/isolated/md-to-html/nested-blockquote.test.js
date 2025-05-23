const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "> Outer quote.\n> > Inner quote.\n> Still outer.";
const expected = '<blockquote>\n  <p>Outer quote.</p>\n  <blockquote>\n    <p>Inner quote.<br />\n    Still outer.</p>\n  </blockquote>\n</blockquote>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: nested blockquote');
