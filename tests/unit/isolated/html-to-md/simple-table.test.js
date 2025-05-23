const assert = require('assert');
const { htmlToMarkdown } = require('../../../converter');

const input = '<table>\n<thead>\n<tr>\n<th style="text-align:left;">Header 1</th>\n<th style="text-align:left;">Header 2</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style="text-align:left;">Cell 1</td>\n<td style="text-align:left;">Cell 2</td>\n</tr>\n<tr>\n<td style="text-align:left;">Cell 3</td>\n<td style="text-align:left;">Cell 4</td>\n</tr>\n</tbody>\n</table>';
const expected = "| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1     | Cell 2     |\n| Cell 3     | Cell 4     |";

const result = htmlToMarkdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: simple table');
