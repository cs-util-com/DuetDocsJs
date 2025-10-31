const { htmlToMarkdown } = require('../src/converter.js');

describe('Converter edge-case branches', () => {
  test('table with tbody row that has no td returns empty string (firstRowCells.length === 0)', () => {
    const html = '<table><tbody><tr></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    expect(md).toBe('');
  });

  test('header default alignment marker is used when no style provided', () => {
    const html = '<table><thead><tr><th>HeaderA</th><th>HeaderB</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    // default marker should be present in alignment row (---)
    expect(md).toContain('| --- |');
  });

  test('table with tbody-first-row becomes header when no thead present', () => {
    const html = '<table><tbody><tr><td>H1</td><td>H2</td></tr><tr><td>a</td><td>b</td></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('| H1 | H2 |');
    expect(md).toContain('| --- | --- |');
  // body line should contain the a and b cells (spacing depends on header widths)
  expect(md).toContain('| a');
  expect(md).toContain('| b');
  });

  test('completely empty table returns empty string', () => {
    const html = '<table></table>';
    const md = htmlToMarkdown(html);
    expect(md).toBe('');
  });
});
