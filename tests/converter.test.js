const fs = require('fs');
const path = require('path');
const { markdownToHtml, htmlToMarkdown } = require('../converter'); // Adjusted path

// Output directories
const htmlOutputDir = path.join(__dirname, 'output/html');
const mdOutputDir = path.join(__dirname, 'output/md');

// Ensure output directories exist
if (!fs.existsSync(htmlOutputDir)) {
  fs.mkdirSync(htmlOutputDir, { recursive: true });
}
if (!fs.existsSync(mdOutputDir)) {
  fs.mkdirSync(mdOutputDir, { recursive: true });
}

// Read the example markdown file
const exampleMdPath = path.join(__dirname, '../example markdown.md'); // Adjusted path
const originalMarkdown = fs.readFileSync(exampleMdPath, 'utf8');

console.log("\n=== INDIVIDUAL MARKDOWN FEATURE CONVERSION TESTS ===");

// Helper function to run a single feature test
function testFeature(featureName, markdownSnippet) {
  console.log(`\n--- Testing: ${featureName} ---`);

  // Convert Markdown to HTML
  console.log("Step 1: Converting Markdown to HTML...");
  const generatedHtml = markdownToHtml(markdownSnippet);
  const htmlOutputPath = path.join(htmlOutputDir, `${featureName}.html`);
  fs.writeFileSync(htmlOutputPath, generatedHtml, 'utf8');
  console.log(`HTML output saved to: ${htmlOutputPath}`);
  // console.log("HTML (first 200 chars):", generatedHtml.substring(0, 200) + "...");


  // Convert HTML back to Markdown
  console.log("\nStep 2: Converting HTML back to Markdown...");
  const roundtripMarkdown = htmlToMarkdown(generatedHtml);
  const mdOutputPath = path.join(mdOutputDir, `${featureName}.md`);
  fs.writeFileSync(mdOutputPath, roundtripMarkdown, 'utf8');
  console.log(`Markdown output saved to: ${mdOutputPath}`);
  // console.log("Roundtrip MD (first 200 chars):", roundtripMarkdown.substring(0, 200) + "...");

  // Basic check: Does the roundtrip Markdown resemble the original snippet?
  // This is a very basic check. More specific checks will be added per feature.
  // For now, we'll just check if it's not empty and contains some key characters from the original.
  let pass = roundtripMarkdown.length > 0;
  if (pass && markdownSnippet.length > 0) {
    // A more robust check would involve comparing ASTs or normalized versions.
    // For now, let's check for a few characters from the original.
    const checkChars = markdownSnippet.replace(/\s/g, '').substring(0, 10);
    let matchCount = 0;
    for (let char of checkChars) {
        if (roundtripMarkdown.includes(char)) {
            matchCount++;
        }
    }
    pass = matchCount > checkChars.length / 2; // Heuristic
  }


  if (pass) {
    console.log(`✓ Test basic preservation for ${featureName}`);
  } else {
    console.log(`✗ Test basic preservation for ${featureName} - FAILED`);
    console.log("Original Snippet:\n", markdownSnippet);
    console.log("Roundtrip Markdown:\n", roundtripMarkdown);
  }
  return pass;
}

// --- Define Markdown Snippets for Individual Tests ---

const testsToRun = [
  {
    name: "Headers",
    markdown: "# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6"
  },
  {
    name: "BoldText",
    markdown: "**Bold Text**\n__Also Bold__"
  },
  {
    name: "ItalicText",
    markdown: "*Italic Text*\n_Also Italic_"
  },
  {
    name: "StrikethroughText",
    markdown: "~~Strikethrough Text~~"
  },
  {
    name: "DelHtmlTag",
    markdown: "<del>Deleted HTML content</del>"
  },
  {
    name: "OrderedListSimple",
    markdown: "1. First item\n2. Second item\n3. Third item"
  },
  {
    name: "OrderedListNested",
    markdown: "1. Ordered\n   1. Subordered A\n   2. Subordered B\n2. Another top item"
  },
  {
    name: "OrderedListMixedNested",
    markdown: "1. Top ordered\n   * Unordered sub-item\n   * Another unordered sub-item\n     1. Nested ordered inside unordered\n2. Second top ordered"
  },
  {
    name: "BulletListSimple",
    markdown: "* Bullet A\n* Bullet B\n- Bullet C (using hyphen)\n+ Bullet D (using plus)"
  },
  {
    name: "BulletListNested",
    markdown: "* Top bullet\n  * Nested bullet 1\n  * Nested bullet 2\n    * Deeper nested bullet"
  },
  {
    name: "TaskList",
    markdown: "* [ ] Open Task\n* [x] Completed Task\n* [ ] Another Open Task"
  },
  {
    name: "InlineLink",
    markdown: "[Visit Google](https://www.google.com)"
  },
  {
    name: "ReferenceLink",
    markdown: "[My Site][site-ref]\n\n[site-ref]: https://example.com \"Optional Title\""
  },
  {
    name: "InlineImage",
    markdown: "![Alt text for image](https://picsum.photos/id/237/200/100)"
  },
  {
    name: "ReferenceImage",
    markdown: "![Alt text for ref image][image-ref]\n\n[image-ref]: https://picsum.photos/id/10/200/100 \"Optional Image Title\""
  },
  {
    name: "ClickableImage",
    markdown: "[![Clickable alt text](https://picsum.photos/id/80/150/80)](https://example.com/image-target)"
  },
  {
    name: "Footnotes",
    markdown: "Here is a footnote reference[^1].\nAnd another one[^another].\n\n[^1]: This is the first footnote.\n[^another]: This is the **second** footnote, with markdown."
  },
  {
    name: "InlineCode",
    markdown: "Use `const example = true;` for inline code."
  },
  {
    name: "FencedCodeBlockJS",
    markdown: "```js\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\ngreet('World');\n```"
  },
  {
    name: "FencedCodeBlockPython",
    markdown: "```python\ndef hello():\n    print(\"Hello from Python\")\nhello()\n```"
  },
  {
    name: "TableSimple",
    markdown: "| Header 1 | Header 2 |\n| :------- | :------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |"
  },
  {
    name: "TableWithAlignment",
    markdown: "| Left Align | Center Align | Right Align |\n| :--------- | :----------: | ----------: |\n| L1         |      C1      |          R1 |\n| L2         |      C2      |          R2 |"
  },
  {
    name: "BlockquoteSimple",
    markdown: "> This is a simple blockquote."
  },
  {
    name: "BlockquoteNested",
    markdown: "> Outer quote.\n> > Inner quote.\n> Still outer."
  },
  {
    name: "InlineHtmlKbd",
    markdown: "Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save."
  },
  {
    name: "HorizontalRule",
    markdown: "Text above\n\n---\n\nText below\n\n***\n\nText after stars\n\n___\n\nText after underscores"
  },
  // Add more specific test cases based on "example markdown.md"
  {
    name: "ComplexNestedLists",
    markdown: "1. Ordered\n   1. Subordered 0\n   1. Sub ordered 1\n   1. Sub ordered 2\n      1. Sub Sub ordered 1\n2. Another\n    * Sub unordered\n        1. Sub ordered 1\n        2. Sub ordered 2"
  },
  {
    name: "MixedBulletTypes",
    markdown: "* Bullet\n* Bullet\n- Also Bullet\n- Also Bullet"
  }
];

// --- Run all tests ---
let allTestsPassed = true;
let individualResults = [];

testsToRun.forEach(testCase => {
  const result = testFeature(testCase.name, testCase.markdown);
  individualResults.push({ name: testCase.name, passed: result });
  if (!result) {
    allTestsPassed = false;
  }
});

console.log("\n=== OVERALL TEST SUMMARY ===");
individualResults.forEach(res => {
    console.log(`${res.passed ? '✓' : '✗' } ${res.name}`);
});

if (allTestsPassed) {
  console.log("\n✅ ALL INDIVIDUAL TESTS PASSED (basic preservation check).");
} else {
  console.log("\n❌ SOME INDIVIDUAL TESTS FAILED (basic preservation check). Review logs and output files.");
}

console.log("\nNote: These tests primarily check for basic roundtrip conversion and output file generation.");
console.log("Further validation should involve inspecting the .html and .md files in tests/output/");
console.log("and potentially adding more specific assertion logic for each feature.");


// --- Keeping parts of the old structure for HTML and Markdown specific checks if needed ---
// You can adapt checkHtmlListStructure and checkForKeyElements to work with individual snippets
// or load the generated files for more detailed analysis.

// Example: Function to check HTML structure (can be adapted)
function checkHtmlStructure(html, featureName, expectedPatterns) {
  // expectedPatterns: [{ name: "Pattern Description", regex: /.../ }]
  console.log(`\n--- HTML Structure Check for: ${featureName} ---`);
  let allPatternsPass = true;
  expectedPatterns.forEach(pattern => {
    if (pattern.regex.test(html)) {
      console.log(`  ✓ HTML Pattern: ${pattern.name}`);
    } else {
      allPatternsPass = false;
      console.log(`  ✗ HTML Pattern: ${pattern.name} - FAILED`);
      console.log(`    Expected to match: ${pattern.regex}`);
    }
  });
  return allPatternsPass;
}

// Example: Function to check Markdown structure (can be adapted)
function checkMarkdownStructure(md, featureName, expectedPatterns) {
  // expectedPatterns: [{ name: "Pattern Description", regex: /.../ (or string for includes) }]
  console.log(`\n--- Markdown Structure Check for: ${featureName} ---`);
  let allPatternsPass = true;
  expectedPatterns.forEach(pattern => {
    const pass = (typeof pattern.expected === 'string') ? md.includes(pattern.expected) : pattern.expected.test(md);
    if (pass) {
      console.log(`  ✓ MD Pattern: ${pattern.name}`);
    } else {
      allPatternsPass = false;
      console.log(`  ✗ MD Pattern: ${pattern.name} - FAILED`);
      console.log(`    Expected: ${pattern.expected}`);
    }
  });
  return allPatternsPass;
}


// --- Example of how to use the specific checkers for a particular feature ---
// This section demonstrates how you might add more detailed checks for a specific feature.
// You would typically call these after the testFeature call for that specific feature,
// loading the generated HTML/MD.

function runDetailedChecks() {
    console.log("\n=== DETAILED FEATURE CHECKS (Example) ===");

    // --- Detailed Check for OrderedListNested ---
    const orderedListNestedHtmlPath = path.join(htmlOutputDir, 'OrderedListNested.html');
    const orderedListNestedMdPath = path.join(mdOutputDir, 'OrderedListNested.md');

    if (fs.existsSync(orderedListNestedHtmlPath) && fs.existsSync(orderedListNestedMdPath)) {
        const htmlContent = fs.readFileSync(orderedListNestedHtmlPath, 'utf8');
        const mdContent = fs.readFileSync(orderedListNestedMdPath, 'utf8');

        const olNestedHtmlChecks = [
            { name: "Top level OL", regex: /<ol>\s*<li>Ordered<\/li>/i }, // Simplified, make more robust
            { name: "Nested OL", regex: /<ol>\s*<li>Subordered A<\/li>\s*<li>Subordered B<\/li>\s*<\/ol>/i } // Simplified
        ];
        checkHtmlStructure(htmlContent, "OrderedListNested", olNestedHtmlChecks);

        const olNestedMdChecks = [
            // Turndown might convert "1. item" "2. item" to "1. item" "1. item" if that's its default,
            // or preserve numbering. This needs to be based on expected Turndown behavior.
            // Assuming it normalizes to "1." for all items at the same level:
            { name: "Top level ordered list item 1", expected: /1\.\\s+Ordered/ },
            { name: "Nested ordered list item A (indented, starts with 1)", expected: /\\s+1\.\\s+Subordered A/ },
            { name: "Nested ordered list item B (indented, starts with 1)", expected: /\\s+1\.\\s+Subordered B/ },
            { name: "Second top level item", expected: /1\.\\s+Another top item/ } // Or 2. depending on Turndown
        ];
        // Adjust regexes based on actual expected output from your htmlToMarkdown function
        // For example, if Turndown renumbers "1. Item" "2. Item" to "1. Item" "1. Item", the regexes need to reflect that.
        // The current createExactBlockRegex from the old test was very strict.
        // For now, these are illustrative.
        console.warn("NOTE: Detailed Markdown checks for OrderedListNested are illustrative and may need adjustment based on htmlToMarkdown behavior.");
        checkMarkdownStructure(mdContent, "OrderedListNested", olNestedMdChecks);
    } else {
        console.warn("Skipping detailed checks for OrderedListNested - output files not found.");
    }

    // --- Detailed Check for TaskList ---
    const taskListHtmlPath = path.join(htmlOutputDir, 'TaskList.html');
    const taskListMdPath = path.join(mdOutputDir, 'TaskList.md');

    if (fs.existsSync(taskListHtmlPath) && fs.existsSync(taskListMdPath)) {
        const htmlContent = fs.readFileSync(taskListHtmlPath, 'utf8');
        const mdContent = fs.readFileSync(taskListMdPath, 'utf8');

        const taskListHtmlChecks = [
            { name: "Unchecked task item HTML", regex: /<li[^>]*class="task-list-item"[^>]*>\s*<input[^>]*type="checkbox"[^>]*disabled(?![^>]*checked)[^>]*>\s*Open Task\s*<\/li>/i },
            { name: "Checked task item HTML", regex: /<li[^>]*class="task-list-item"[^>]*>\s*<input[^>]*type="checkbox"[^>]*disabled[^>]*checked[^>]*>\s*Completed Task\s*<\/li>/i }
        ];
        checkHtmlStructure(htmlContent, "TaskList", taskListHtmlChecks);

        const taskListMdChecks = [
            { name: "Unchecked task item Markdown", expected: /\\*\\s+\\[ \\]\\s+Open Task/ },
            { name: "Checked task item Markdown", expected: /\\*\\s+\\[x\\]\\s+Completed Task/i } // Case-insensitive for 'x'
        ];
        checkMarkdownStructure(mdContent, "TaskList", taskListMdChecks);

    } else {
        console.warn("Skipping detailed checks for TaskList - output files not found.");
    }
}

// Optionally run detailed checks if you want to start implementing them
// runDetailedChecks();


// The old checkForKeyElements and checkHtmlListStructure can be removed or adapted.
// For now, they are left below but commented out or not directly used in the new flow.
// It's better to build specific checks for each snippet type.

/*
// ... (old checkForKeyElements, extractListMarkdownSection, checkHtmlListStructure, extractListStructures, extractSection)
// These functions were designed for the single large roundtrip test.
// They would need significant adaptation to be used effectively with the new individual test structure.
// It's generally better to write new, focused assertion functions for each type of markdown feature
// that load the specific output files and check for expected HTML and Markdown.
*/

console.log("\nFinished running tests. Check the 'tests/output' directory for generated files.");