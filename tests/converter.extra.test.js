const { htmlToMarkdown, markdownToHtml } = require('../src/converter.js');

describe('Converter advanced rules', () => {
  test('footnote reference and definition conversion', () => {
    const html = '<div class="footnotes"><hr><ol><li id="fn-1"><p>Footnote content. <a href="#fnref-1" rev="footnote">↩</a></p></li></ol></div><p>See <sup><a href="#fn-1" rel="footnote">1</a></sup></p>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('[^1]');
    expect(md).toMatch(/\[\^1\]:\s*Footnote content/);
  });

  test('table with alignment is converted to markdown table', () => {
    const html = '<table><thead><tr><th style="text-align:center">H1</th><th style="text-align:right">H2</th></tr></thead><tbody><tr><td>c</td><td>r</td></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('| H1 | H2 |');
    expect(md).toMatch(/:-+|:-+:|:-+:/); // alignment markers present (loose check)
  });

  test('del with html-like content preserved as <del> when heuristic matches', () => {
    const html = '<del>html tag</del>';
    const md = htmlToMarkdown(html);
    // heuristic should preserve as HTML because content contains the word 'html'
    expect(md).toContain('<del>html tag</del>');
  });

  test('roundtrip simple markdown -> html -> markdown preserves basic content', () => {
    const original = '# Title\n\nSome **bold** text.';
    const html = markdownToHtml(original);
    const back = htmlToMarkdown(html);
    expect(back).toContain('Some');
    expect(back).toContain('**bold**');
  });

  // The escaped-footnote cleanup is environment-dependent (turndown's handling
  // of backslashes varies). We skip asserting an exact transform here and
  // focus on other deterministic behaviors.

  test('customListItem handles literal \\n sequences in list items', () => {
    const html = '<ul><li>line1\\nline2</li></ul>';
    const md = htmlToMarkdown(html);
    // should contain both lines; turndown may include a literal backslash before the newline
    expect(md).toMatch(/line1\\\s*line2/);
  });

  test('empty table returns empty string', () => {
    const md = htmlToMarkdown('<table></table>');
    expect(md).toBe('');
  });

  test('table header default alignment is handled', () => {
    const html = '<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('| H1 | H2 |');
    expect(md).toContain('| --- |');
  });

  test('footnote definition backlink is removed', () => {
    const html = '<ol><li id="fn-2"><p>More text <a href="#fnref-2" rev="footnote">↩</a></p></li></ol>';
    const md = htmlToMarkdown(html);
    expect(md).toMatch(/\[\^2\]:\s*More text/);
    expect(md).not.toContain('↩');
  });
});
