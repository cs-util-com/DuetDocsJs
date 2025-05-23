const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "[![Clickable alt text](https://picsum.photos/id/80/150/80)](https://example.com/image-target)";
const expected = '<p><a href="https://example.com/image-target"><img src="https://picsum.photos/id/80/150/80" alt="Clickable alt text" /></a></p>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: clickable image');
