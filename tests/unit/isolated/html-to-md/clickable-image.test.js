const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<p><a href="https://example.com/image-target"><img src="https://picsum.photos/id/80/150/80" alt="Clickable alt text" /></a></p>';
const expected = "[![Clickable alt text](https://picsum.photos/id/80/150/80)](https://example.com/image-target)";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: clickable image');
