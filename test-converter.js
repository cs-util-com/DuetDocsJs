const { markdownToHtml, htmlToMarkdown } = require('./converter.js');

const testMd = '# Header 1\n## Header 2';
console.log('Original:', JSON.stringify(testMd));

const html = markdownToHtml(testMd);
console.log('HTML:', JSON.stringify(html));

const backToMd = htmlToMarkdown(html);
console.log('Back to MD:', JSON.stringify(backToMd));
