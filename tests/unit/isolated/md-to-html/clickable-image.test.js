const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "[![Clickable alt text](https://picsum.photos/id/80/150/80)](https://example.com/image-target)";
const expected = '<p><a href="https://example.com/image-target"><img src="https://picsum.photos/id/80/150/80" alt="Clickable alt text" /></a></p>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: clickable image');
