const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<pre><code class="js language-js">function greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet(\'World\');</code></pre>';
const expected = "```js\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet('World');\n```";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: fenced code block JS');
