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
});
