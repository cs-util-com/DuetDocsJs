const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<pre><code class="js language-js">function greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet(\'World\');</code></pre>';
const expected = "```js\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet('World');\n```";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: fenced code block JS');
