const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<pre><code class="python language-python">def hello():\n    print("Hello from Python")\nhello()</code></pre>';
const expected = "```python\ndef hello():\n    print(\"Hello from Python\")\nhello()\n```";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: fenced code block Python');
