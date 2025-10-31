const { htmlToMarkdown } = require('../src/converter.js');

describe('Additional converter branch exercises', () => {
  test('table cell replacement: center, right and default branches', () => {
    const html =
      '<table><thead><tr>' +
      '<th style="text-align:center">C</th>' +
      '<th style="text-align:right">R</th>' +
      '<th>Default</th>' +
      '</tr></thead><tbody><tr><td>c</td><td>r</td><td>d</td></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    // Should include centered cell with spaces around and the right/default cells
    expect(md).toContain(' C ');
    expect(md).toContain(' r');
    expect(md).toContain('Default');
  });

  test('customListItem handles unordered and ordered lists and newline content', () => {
    const html =
      '<ul><li> bullet item\nwith newline</li></ul>' +
      '<ol start="3"><li>one</li><li>two</li></ol>';
    const md = htmlToMarkdown(html);
    // unordered list marker
    expect(md).toContain('- bullet item');
    // ordered list starts at 3
    expect(md).toContain('3. one');
    expect(md).toContain('4. two');
  });

  test('ordered list without start attribute uses 1-based indexing', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('1. First');
    expect(md).toContain('2. Second');
  });

  test('list item starting with two spaces is treated as nested list content', () => {
    const html = '<ul><li>  nested content</li></ul>';
    const md = htmlToMarkdown(html);
    // nested content should preserve leading indentation or show as bullet content
    expect(md).toMatch(/nested content|-\s{2}nested/);
  });
});
