const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><img src="https://picsum.photos/id/237/200/100" alt="Alt text for image" /></p>';
const expected = "![Alt text for image](https://picsum.photos/id/237/200/100)";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: inline image');
