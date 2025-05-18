// /workspaces/DuetDocsJs/tests/unit/unit_richtext.test.js
const { markdownToHtml, htmlToMarkdown } = require('../converter');

console.log("=== UNIT TESTS: RICH TEXT ===");

const richTextTestCases = [
    // Italic
    { testType: "mdToHtml", name: "Italic MD (*word*)->HTML", md: "*italic*", expectedHtml: "<p><em>italic</em></p>" },
    { testType: "htmlToMd", name: "Italic HTML (<em>word</em>)->MD", html: "<p><em>italic</em></p>", expectedMd: "*italic*" },
    { testType: "mdToHtml", name: "Italic MD (_word_)->HTML", md: "_italic_", expectedHtml: "<p><em>italic</em></p>" },
    { testType: "htmlToMd", name: "Italic HTML (<em>word</em>) from _ source ->MD", html: "<p><em>italic</em></p>", expectedMd: "*italic*" }, // Turndown emDelimiter is "*"

    // Bold
    { testType: "mdToHtml", name: "Bold MD (**word**)->HTML", md: "**bold**", expectedHtml: "<p><strong>bold</strong></p>" },
    { testType: "htmlToMd", name: "Bold HTML (<strong>word</strong>)->MD", html: "<p><strong>bold</strong></p>", expectedMd: "**bold**" },
    { testType: "mdToHtml", name: "Bold MD (__word__)->HTML", md: "__bold__", expectedHtml: "<p><strong>bold</strong></p>" },
    { testType: "htmlToMd", name: "Bold HTML (<strong>word</strong>) from __ source ->MD", html: "<p><strong>bold</strong></p>", expectedMd: "**bold**" }, // Turndown strongDelimiter is "**"

    // Bold Italic
    { testType: "mdToHtml", name: "Bold Italic MD (***word***)->HTML", md: "***bold italic***", expectedHtml: "<p><strong><em>bold italic</em></strong></p>" },
    { testType: "htmlToMd", name: "Bold Italic HTML (<strong><em>word</em></strong>)->MD", html: "<p><strong><em>bold italic</em></strong></p>", expectedMd: "***bold italic***" },
    { testType: "mdToHtml", name: "Bold Italic MD (___word___)->HTML", md: "___bold italic___", expectedHtml: "<p><strong><em>bold italic</em></strong></p>" },
    { testType: "htmlToMd", name: "Bold Italic HTML (<strong><em>word</em></strong>) from ___ source ->MD", html: "<p><strong><em>bold italic</em></strong></p>", expectedMd: "***bold italic***" },
    { testType: "mdToHtml", name: "Bold Italic MD (_**word**_)->HTML", md: "_**bold italic**_", expectedHtml: "<p><em><strong>bold italic</strong></em></p>" },
    { testType: "htmlToMd", name: "Bold Italic HTML (<em><strong>word</strong></em>)->MD", html: "<p><em><strong>bold italic</strong></em></p>", expectedMd: "***bold italic***" },


    // Strikethrough
    { testType: "mdToHtml", name: "Strikethrough MD (~~word~~)->HTML", md: "~~strike~~", expectedHtml: "<p><del>strike</del></p>" },
    { testType: "htmlToMd", name: "Strikethrough HTML (<del>word</del>)->MD", html: "<p><del>strike</del></p>", expectedMd: "~~strike~~" },
    { testType: "htmlToMd", name: "Strikethrough HTML (<s>word</s>)->MD", html: "<p><s>strike</s></p>", expectedMd: "~~strike~~" },
    { testType: "htmlToMd", name: "Strikethrough HTML (<strike>word</strike>)->MD", html: "<p><strike>strike</strike></p>", expectedMd: "~~strike~~" },
];

richTextTestCases.forEach(tc => {
    if (tc.testType === "mdToHtml") {
        const actualHtml = markdownToHtml(tc.md);
        if (actualHtml === tc.expectedHtml) {
            console.log(`✅ ${tc.name}: Passed`);
        } else {
            console.error(`❌ ${tc.name}: Failed`);
            console.error(`   Input MD:      \`${tc.md}\``);
            console.error(`   Expected HTML: \`${tc.expectedHtml}\``);
            console.error(`   Actual HTML:   \`${actualHtml}\``);
        }
    } else if (tc.testType === "htmlToMd") {
        const actualMd = htmlToMarkdown(tc.html);
        if (actualMd === tc.expectedMd) {
            console.log(`✅ ${tc.name}: Passed`);
        } else {
            console.error(`❌ ${tc.name}: Failed`);
            console.error(`   Input HTML:    \`${tc.html}\``);
            console.error(`   Expected MD:   \`${tc.expectedMd}\``);
            console.error(`   Actual MD:     \`${actualMd}\``);
        }
    }
});
console.log("=== END UNIT TESTS: RICH TEXT ===\\n");
