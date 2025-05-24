const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const TurndownService = require('turndown');
const turndown = new TurndownService();

// Create simple converter functions for testing
function markdownToHtml(markdown) {
  const converter = new showdown.Converter();
  return converter.makeHtml(markdown);
}

function htmlToMarkdown(html) {
  return turndown.turndown(html);
}

// Helper function to write output
function writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown) {
  const output = [
    '--- ORIGINAL MARKDOWN ---',
    originalMarkdown,
    '',
    '--- CONVERTED HTML ---',
    html,
    '',
    '--- RECONVERTED MARKDOWN ---',
    reconvertedMarkdown
  ].join('\n');
  fs.writeFileSync(outputPath, output);
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const inputDir = path.join(__dirname, 'input');

describe('Markdown Conversion Tests', () => {
  test('should correctly convert and reconvert full combined markdown examples', () => {
    const fileName = 'input markdown.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert headers', () => {
    const fileName = 'input markdown copy 1.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert rich text formatting', () => {
    const fileName = 'input markdown copy 2.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert ordered lists', () => {
    const fileName = 'input markdown copy 3.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert bullet lists', () => {
    const fileName = 'input markdown copy 4.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert task lists', () => {
    const fileName = 'input markdown copy 5.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert escaped characters', () => {
    const fileName = 'input markdown copy 6.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert links', () => {
    const fileName = 'input markdown copy 7.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert images', () => {
    const fileName = 'input markdown copy 8.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert footnotes', () => {
    const fileName = 'input markdown copy 9.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert code blocks', () => {
    const fileName = 'input markdown copy 10.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert tables', () => {
    const fileName = 'input markdown copy 11.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert blockquotes', () => {
    const fileName = 'input markdown copy 12.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });

  test('should correctly convert and reconvert inline HTML', () => {
    const fileName = 'input markdown copy 13.md';
    const filePath = path.join(inputDir, fileName);
    const outputPath = path.join(outputDir, `${fileName}.converted.txt`);

    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');

    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);

    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);

    // Write the output to file
    writeOutput(outputPath, originalMarkdown, html, reconvertedMarkdown);

    // Assertion using Jest
    expect(reconvertedMarkdown).toBe(originalMarkdown);
  });
});
