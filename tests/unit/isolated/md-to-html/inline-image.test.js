const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "![Alt text for image](https://picsum.photos/id/237/200/100)";
const expected = '<p><img src="https://picsum.photos/id/237/200/100" alt="Alt text for image" /></p>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: inline image');
