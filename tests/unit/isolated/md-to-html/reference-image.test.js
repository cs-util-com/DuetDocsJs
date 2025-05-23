const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "![Alt text for ref image][image-ref]\n\n[image-ref]: https://picsum.photos/id/10/200/100 \"Optional Image Title\"";
const expected = '<p><img src="https://picsum.photos/id/10/200/100" alt="Alt text for ref image" title="Optional Image Title" /></p>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: reference image');
