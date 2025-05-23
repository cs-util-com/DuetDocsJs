const assert = require('assert');
const { markdown2Html } = require('../../../converter');

const input = "| Header 1 | Header 2 |\n| :------- | :------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |";
const expected = '<table>\n<thead>\n<tr>\n<th id="header_1" style="text-align:left;">Header 1</th>\n<th id="header_2" style="text-align:left;">Header 2</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style="text-align:left;">Cell 1</td>\n<td style="text-align:left;">Cell 2</td>\n</tr>\n<tr>\n<td style="text-align:left;">Cell 3</td>\n<td style="text-align:left;">Cell 4</td>\n</tr>\n</tbody>\n</table>';

const result = markdown2Html(input);
assert.strictEqual(result, expected);

console.log('✅ md-to-html: simple table');
