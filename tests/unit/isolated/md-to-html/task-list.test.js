// tests/unit/isolated/md-to-html/task-list.test.js
// Unit test: convert Markdown task list to HTML
const assert = require('assert');
const { markdownToHtml } = require('../../../converter');

const input = '* [ ] Todo\n* [x] Done';
const expected = '<ul>\n' +
'<li class="task-list-item" style="list-style-type: none;"><input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"> Todo</li>\n' +
'<li class="task-list-item" style="list-style-type: none;"><input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;" checked> Done</li>\n' +
'</ul>';
const actual = markdownToHtml(input);
assert.strictEqual(actual, expected);
console.log('✅ md-to-html: task list');
