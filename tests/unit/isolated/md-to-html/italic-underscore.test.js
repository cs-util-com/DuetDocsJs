// tests/unit/isolated/md-to-html/italic-underscore.test.js
// Unit test: convert italic markdown (_italic_) to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '_italic_';
const expected = '<p><em>italic</em></p>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: italic underscore');
