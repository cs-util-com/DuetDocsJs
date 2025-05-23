const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "![Alt text for image](https://picsum.photos/id/237/200/100)";
const expected = '<p><img src="https://picsum.photos/id/237/200/100" alt="Alt text for image" /></p>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: inline image');
