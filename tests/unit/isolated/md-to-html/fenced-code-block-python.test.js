const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = "```python\ndef hello():\n    print(\"Hello from Python\")\nhello()\n```";
const expected = '<pre><code class="language-python">def hello():\n    print(\"Hello from Python\")\nhello()\n</code></pre>';

const result = markdownToHtml(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: fenced code block Python');
