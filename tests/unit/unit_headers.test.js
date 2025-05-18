// /workspaces/DuetDocsJs/tests/unit/unit_headers.test.js
const { markdownToHtml, htmlToMarkdown } = require('../converter');

console.log("=== UNIT TESTS: HEADERS ===");

const headerTestCases = [
    // Markdown to HTML
    { testType: "mdToHtml", name: "H1 MD->HTML", md: "# Header 1", expectedHtml: "<h1>Header 1</h1>" },
    { testType: "mdToHtml", name: "H2 MD->HTML", md: "## Header 2", expectedHtml: "<h2>Header 2</h2>" },
    { testType: "mdToHtml", name: "H3 MD->HTML", md: "### Header 3", expectedHtml: "<h3>Header 3</h3>" },
    { testType: "mdToHtml", name: "H4 MD->HTML", md: "#### Header 4", expectedHtml: "<h4>Header 4</h4>" },
    { testType: "mdToHtml", name: "H5 MD->HTML", md: "##### Header 5", expectedHtml: "<h5>Header 5</h5>" },
    { testType: "mdToHtml", name: "H6 MD->HTML", md: "###### Header 6", expectedHtml: "<h6>Header 6</h6>" },
    { testType: "mdToHtml", name: "H1 MD->HTML (no space - should be paragraph)", md: "#Header1", expectedHtml: "<p>#Header1</p>" },

    // HTML to Markdown
    { testType: "htmlToMd", name: "H1 HTML->MD", html: "<h1>Header 1</h1>", expectedMd: "# Header 1" },
    { testType: "htmlToMd", name: "H2 HTML->MD", html: "<h2>Header 2</h2>", expectedMd: "## Header 2" },
    { testType: "htmlToMd", name: "H3 HTML->MD", html: "<h3>Header 3</h3>", expectedMd: "### Header 3" },
    { testType: "htmlToMd", name: "H4 HTML->MD", html: "<h4>Header 4</h4>", expectedMd: "#### Header 4" },
    { testType: "htmlToMd", name: "H5 HTML->MD", html: "<h5>Header 5</h5>", expectedMd: "##### Header 5" },
    { testType: "htmlToMd", name: "H6 HTML->MD", html: "<h6>Header 6</h6>", expectedMd: "###### Header 6" },
];

headerTestCases.forEach(tc => {
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
console.log("=== END UNIT TESTS: HEADERS ===\\n");
