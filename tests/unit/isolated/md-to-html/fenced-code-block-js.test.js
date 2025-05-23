const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "```js\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet('World');\n```";
const expected = '<pre><code class="language-js">function greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet(\'World\');</code></pre>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: fenced code block JS');
