// /workspaces/DuetDocsJs/tests/unit/unit_lists.test.js
const { markdownToHtml, htmlToMarkdown } = require('../converter');

console.log("=== UNIT TESTS: LISTS ===");

// Helper for normalizing HTML list output (removes newlines and space between tags)
function normalizeListHtml(html) {
    if (typeof html !== 'string') return '';
    return html.replace(/>\\s+</g, '><').replace(/\\n/g, '').trim();
}

// Helper for normalizing Markdown list output (trims whitespace around items and newlines)
function normalizeListMarkdown(md) {
    if (typeof md !== 'string') return '';
    return md.split('\\n').map(line => line.trim()).filter(line => line.length > 0).join('\\n');
}

const listTestCases = [
    // Unordered Lists (Bullet)
    { 
        testType: "mdToHtml", name: "Simple Bullet List MD->HTML (*)", 
        md: "* Item 1\\n* Item 2", 
        expectedHtml: "<ul><li>Item 1</li><li>Item 2</li></ul>" 
    },
    { 
        testType: "htmlToMd", name: "Simple Bullet List HTML->MD (*)", 
        html: "<ul><li>Item 1</li><li>Item 2</li></ul>", 
        expectedMd: "* Item 1\\n* Item 2"
    },
    { 
        testType: "mdToHtml", name: "Simple Bullet List MD->HTML (-)", 
        md: "- Item 1\\n- Item 2", 
        expectedHtml: "<ul><li>Item 1</li><li>Item 2</li></ul>" 
    },
    { 
        testType: "htmlToMd", name: "Simple Bullet List HTML->MD (- source)", 
        html: "<ul><li>Item 1</li><li>Item 2</li></ul>", 
        expectedMd: "* Item 1\\n* Item 2" // Turndown will use '*'
    },
    { 
        testType: "mdToHtml", name: "Simple Bullet List MD->HTML (+)", 
        md: "+ Item 1\\n+ Item 2", 
        expectedHtml: "<ul><li>Item 1</li><li>Item 2</li></ul>"
    },

    // Ordered Lists
    { 
        testType: "mdToHtml", name: "Simple Ordered List MD->HTML (numbered)", 
        md: "1. Item 1\\n2. Item 2", 
        expectedHtml: "<ol><li>Item 1</li><li>Item 2</li></ol>" 
    },
    { 
        testType: "htmlToMd", name: "Simple Ordered List HTML->MD", 
        html: "<ol><li>Item 1</li><li>Item 2</li></ol>", 
        expectedMd: "1. Item 1\\n2. Item 2" 
    },
    { 
        testType: "mdToHtml", name: "Simple Ordered List MD->HTML (all 1s)", 
        md: "1. Item 1\\n1. Item 2", 
        expectedHtml: "<ol><li>Item 1</li><li>Item 2</li></ol>"
    },
    { 
        testType: "htmlToMd", name: "Simple Ordered List HTML->MD (from all 1s source)", 
        html: "<ol><li>Item 1</li><li>Item 2</li></ol>", 
        expectedMd: "1. Item 1\\n2. Item 2" 
    },

    // Task Lists
    {
        testType: "mdToHtml", name: "Task List MD->HTML",
        md: "* [ ] Open Task\\n* [x] Done Task",
        expectedHtml: "<ul><li class=\\"task-list-item\\"><input type=\\"checkbox\\" disabled=\\"\\" class=\\"task-list-item-checkbox\\"> Open Task</li><li class=\\"task-list-item\\"><input type=\\"checkbox\\" disabled=\\"\\" class=\\"task-list-item-checkbox\\" checked=\\"\\"> Done Task</li></ul>"
    },
    {
        testType: "htmlToMd", name: "Task List HTML->MD",
        html: "<ul><li class=\\"task-list-item\\"><input type=\\"checkbox\\" disabled class=\\"task-list-item-checkbox\\"> Open Task</li><li class=\\"task-list-item\\"><input type=\\"checkbox\\" disabled class=\\"task-list-item-checkbox\\" checked> Done Task</li></ul>",
        expectedMd: "* [ ] Open Task\\n* [x] Done Task"
    }
];

listTestCases.forEach(tc => {
    if (tc.testType === "mdToHtml") {
        const actualHtml = markdownToHtml(tc.md);
        const normalizedActualHtml = normalizeListHtml(actualHtml);
        const normalizedExpectedHtml = normalizeListHtml(tc.expectedHtml);

        if (normalizedActualHtml === normalizedExpectedHtml) {
            console.log(`✅ ${tc.name}: Passed`);
        } else {
            console.error(`❌ ${tc.name}: Failed`);
            console.error(`   Input MD:        \`${tc.md}\``);
            console.error(`   Expected HTML (raw): \`${tc.expectedHtml}\``);
            console.error(`   Actual HTML (raw):   \`${actualHtml}\``);
            console.error(`   Expected HTML (norm):\`${normalizedExpectedHtml}\``);
            console.error(`   Actual HTML (norm):  \`${normalizedActualHtml}\``);
        }
    } else if (tc.testType === "htmlToMd") {
        const actualMd = htmlToMarkdown(tc.html);
        const normalizedActualMd = normalizeListMarkdown(actualMd);
        const normalizedExpectedMd = normalizeListMarkdown(tc.expectedMd);
        
        if (normalizedActualMd === normalizedExpectedMd) {
            console.log(`✅ ${tc.name}: Passed`);
        } else {
            console.error(`❌ ${tc.name}: Failed`);
            console.error(`   Input HTML:      \`${tc.html}\``);
            console.error(`   Expected MD (raw): \`${tc.expectedMd}\``);
            console.error(`   Actual MD (raw):   \`${actualMd}\``);
            console.error(`   Expected MD (norm):\`${normalizedExpectedMd}\``);
            console.error(`   Actual MD (norm):  \`${normalizedActualMd}\``);
        }
    }
});
console.log("=== END UNIT TESTS: LISTS ===\\n");
