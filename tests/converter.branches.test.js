const { htmlToMarkdown } = require('../src/converter.js');

describe('Converter branch coverage tests', () => {
  test('table header alignments produce correct alignment markers', () => {
    const html =
      '<table><thead><tr>' +
      '<th style="text-align:left">L</th>' +
      '<th style="text-align:center">C</th>' +
      '<th style="text-align:right">R</th>' +
      '</tr></thead><tbody><tr><td>l</td><td>c</td><td>r</td></tr></tbody></table>';
    const md = htmlToMarkdown(html);
    // left uses :---, center uses :----:, right uses ----:
    expect(md).toContain(':---');
    expect(md).toContain(':----:');
    expect(md).toContain('----:');
  });

  test('smartDel keeps HTML-like content wrapped in <del>', () => {
    // Use literal word 'tag' so the htmlPattern (which checks for 'tag' text)
    // matches the content that turndown passes to the rule replacement.
    const html = '<p><del>contains tag</del></p>';
    const md = htmlToMarkdown(html);
    // Should preserve as <del>...</del> because content matches htmlPattern
    expect(md).toContain('<del>contains tag</del>');
  });

  test('ordered list with start attribute preserves numbering from start', () => {
    const html = '<ol start="5"><li>One</li><li>Two</li></ol>';
    const md = htmlToMarkdown(html);
    // Should start numbering at 5
    expect(md).toContain('5. One');
    expect(md).toContain('6. Two');
  });

  test('footnote definition rule outputs a footnote definition without backlink', () => {
    const html = '<ol><li id="fn-1">Note content <a rev="footnote" href="#fnref-1">↩</a></li></ol>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('[^1]:');
    expect(md).toContain('Note content');
    // backlink should not be present
    expect(md).not.toContain('↩');
  });
});
