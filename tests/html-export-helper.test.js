const { createCompleteHtmlDocument } = require('../src/html-export-helper.js');

describe('HTML Export Helper', () => {
  test('creates a complete HTML document with title and body', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    const doc = createCompleteHtmlDocument(html, 'My Title', false);

    expect(doc).toContain('<!DOCTYPE html>');
    expect(doc).toContain('<title>My Title</title>');
    expect(doc).toContain('<p>Hello <strong>World</strong></p>');
    expect(doc).toContain('<body>');
  });

  test('sanitizes dangerous content (script and on* attributes and javascript:)', () => {
    const malicious = '<div onclick="alert(1)"><a href="javascript:alert(2)">x</a><script>alert(3)</script></div>';
    const doc = createCompleteHtmlDocument(malicious, 'Bad', false);

    expect(doc).not.toContain('<script>alert(3)</script>');
    expect(doc).not.toContain('onclick="alert(1)"');
    expect(doc).not.toContain('javascript:alert(2)');
  });

  test('applies dark styles when isDark=true', () => {
    const html = '<p>Dark mode</p>';
    const doc = createCompleteHtmlDocument(html, 'Dark', true);
    // Check that the style contains a dark background color
    expect(doc).toContain("background-color: #1e1e1e");
  });

  test('uses DOMPurify.sanitize when available', () => {
    global.DOMPurify = {
      sanitize: (content) => {
        // simple marker to show branch executed
        return 'SANITIZED:' + content;
      },
    };
    const html = '<p>Dirty</p><script>alert(1)</script>';
    const doc = createCompleteHtmlDocument(html, 'Safe', false);
    expect(doc).toContain('SANITIZED:');
    // cleanup
    delete global.DOMPurify;
  });
});
