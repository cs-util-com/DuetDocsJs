const { htmlToMarkdown } = require('../src/converter.js');

describe('Converter branch coverage helpers', () => {
  test('smartDel falls back to ~~ when heuristic does not match', () => {
    const md = htmlToMarkdown('<del>plain text</del>');
    expect(md).toContain('~~plain text~~');
  });

  test('ordered list with start attribute preserves numbering', () => {
    const html = '<ol start="5"><li>one</li><li>two</li></ol>';
    const md = htmlToMarkdown(html);
    // Expect the first item to start with '5.'
    expect(md).toMatch(/5\.\s*one/);
  });
});
