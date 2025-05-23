const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><img src="https://picsum.photos/id/10/200/100" alt="Alt text for ref image" title="Optional Image Title" /></p>';
const expected = "![Alt text for ref image](https://picsum.photos/id/10/200/100 \"Optional Image Title\")";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: reference image');
