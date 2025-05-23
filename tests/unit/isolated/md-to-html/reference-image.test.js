const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "![Alt text for ref image][image-ref]\n\n[image-ref]: https://picsum.photos/id/10/200/100 \"Optional Image Title\"";
const expected = '<p><img src="https://picsum.photos/id/10/200/100" alt="Alt text for ref image" title="Optional Image Title" /></p>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: reference image');
