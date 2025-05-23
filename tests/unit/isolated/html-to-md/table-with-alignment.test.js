const assert = require('assert');
const { html2Markdown } = require('../../../converter');

const input = '<table>\n<thead>\n<tr>\n<th id="left_align" style="text-align:left;">Left Align</th>\n<th id="center_align" style="text-align:center;">Center Align</th>\n<th id="right_align" style="text-align:right;">Right Align</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style="text-align:left;">L1</td>\n<td style="text-align:center;">C1</td>\n<td style="text-align:right;">R1</td>\n</tr>\n<tr>\n<td style="text-align:left;">L2</td>\n<td style="text-align:center;">C2</td>\n<td style="text-align:right;">R2</td>\n</tr>\n</tbody>\n</table>';
const expected = "| Left Align | Center Align | Right Align |\n| :--- | :----: | ----: |\n| L1 | C1 | R1 |\n| L2 | C2 | R2 |";

const result = html2Markdown(input);
assert.strictEqual(result, expected);

console.log('✅ html-to-md: table with alignment');
