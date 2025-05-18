// tests/unit/isolated/html-to-md/task-list.test.js
// Unit test: convert HTML task list to Markdown
const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<ul><li class="task-list-item"><input type="checkbox" disabled class="task-list-item-checkbox"> Todo</li><li class="task-list-item"><input type="checkbox" disabled class="task-list-item-checkbox" checked> Done</li></ul>';
const expected = '* [ ]  Todo\n* [x]  Done';
const actual = htmlToMarkdown(input);
assert.strictEqual(actual, expected);
console.log('✅ html-to-md: task list');
