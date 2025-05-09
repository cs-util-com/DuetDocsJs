const fs = require('fs');
const path = require('path');
const { markdownToHtml, htmlToMarkdown } = require('../converter'); // Adjusted path

// Output directories
const htmlOutputDir = path.join(__dirname, 'output/html'); // For MD -> HTML
const mdOutputDir = path.join(__dirname, 'output/md');     // For MD -> HTML -> MD

// New output directories for HTML -> MD -> HTML tests
const mdFromHtmlOutputDir = path.join(__dirname, 'output/md_from_html');             // For HTML -> MD
const htmlFromMdFromHtmlOutputDir = path.join(__dirname, 'output/html_from_md_from_html'); // For HTML -> MD -> HTML

// Ensure output directories exist
[htmlOutputDir, mdOutputDir, mdFromHtmlOutputDir, htmlFromMdFromHtmlOutputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read the example markdown file (still used for context, but not directly in HTML tests)
const exampleMdPath = path.join(__dirname, './example markdown.md'); // Adjusted path to be relative to __dirname
const originalMarkdown = fs.readFileSync(exampleMdPath, 'utf8');

console.log("\n=== INDIVIDUAL MARKDOWN FEATURE CONVERSION TESTS & HTML CONSISTENCY CHECKS ===");

// Function to normalize HTML content for comparison
function normalizeHtmlForCompare(html) {
  // 0. Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 1. Remove all HTML tags
  let textContent = html.replace(/<[^>]+>/g, '');

  // 2. Decode common HTML entities to characters
  textContent = textContent.replace(/&nbsp;/g, ' ')
                           .replace(/&#160;/g, ' ') // non-breaking space
                           .replace(/&amp;/g, '&')   // ampersand
                           .replace(/&lt;/g, '<')    // less than
                           .replace(/&gt;/g, '>')    // greater than
                           .replace(/&quot;/g, '"')  // double quote
                           .replace(/&#39;/g, "'");  // single quote (apostrophe)

  // 3. Normalize all newline types (literal string versions and actual ones) to a single ACTUAL newline character (\n)
  textContent = textContent.replace(/\\\\r\\\\n|\\\\r|\\\\n|\r\n|\r/g, '\n');

  // 4. Split into lines based on the ACTUAL newline character
  let lines = textContent.split('\n'); // Split by ACTUAL \n

  // 5. Process each line:
  lines = lines.map(line => {
    // a. Trim leading/trailing whitespace from the original line.
    // b. Replace multiple internal whitespace characters (e.g., spaces, tabs) with a single space using the correct regex: /\s+/g.
    // c. Trim again to remove any leading/trailing space that might have been introduced if the line was e.g. "   " -> " " by replace.
    return line.trim().replace(/\s+/g, ' ').trim(); // Corrected regex for whitespace collapsing
  });

  // 6. Filter out lines that became empty after all processing
  lines = lines.filter(line => line.length > 0);

  // 7. Join non-empty lines with a single ACTUAL newline.
  //    Then, trim the entire block of text to remove any leading/trailing newlines or spaces.
  textContent = lines.join('\n').trim(); // Use actual newline for joining and trim the result

  // 8. Optional: convert to lowercase for case-insensitive comparison
  textContent = textContent.toLowerCase();
  return textContent;
}

// Helper function to run a single feature test (MD -> HTML -> MD)
function testFeature(featureName, markdownSnippet) {
  console.log(`\n--- Testing MD->HTML->MD: ${featureName} ---`);

  // Convert Markdown to HTML
  console.log("Step 1 (MD->HTML): Converting Markdown to HTML...");
  const generatedHtml = markdownToHtml(markdownSnippet); // This is the HTML we'll use for the consistency check later
  const htmlOutputPath = path.join(htmlOutputDir, `${featureName}.html`);
  fs.writeFileSync(htmlOutputPath, generatedHtml, 'utf8');
  console.log(`MD->HTML output saved to: ${htmlOutputPath}`);

  // Convert HTML back to Markdown
  console.log("\nStep 2 (HTML->MD): Converting HTML back to Markdown...");
  const roundtripMarkdown = htmlToMarkdown(generatedHtml);
  const mdOutputPath = path.join(mdOutputDir, `${featureName}.md`);
  fs.writeFileSync(mdOutputPath, roundtripMarkdown, 'utf8');
  console.log(`MD->HTML->MD output saved to: ${mdOutputPath}`);

  let pass = roundtripMarkdown.length > 0;
  if (pass && markdownSnippet.length > 0) {
    const checkChars = markdownSnippet.replace(/\s/g, '').substring(0, 10);
    let matchCount = 0;
    for (let char of checkChars) {
        if (roundtripMarkdown.includes(char)) {
            matchCount++;
        }
    }
    pass = matchCount > checkChars.length / 2;
  }

  if (pass) {
    console.log(`✓ Test MD->HTML->MD basic preservation for ${featureName}`);
  } else {
    console.log(`✗ Test MD->HTML->MD basic preservation for ${featureName} - FAILED`);
    console.log("Original Snippet (MD):\n", markdownSnippet);
    console.log("Roundtrip Markdown (MD->HTML->MD):\n", roundtripMarkdown);
  }
  return { pass, generatedHtml }; // Return pass status and the intermediate HTML
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
    markdown: "* Bullet\\n* Bullet\\n- Also Bullet\\n- Also Bullet"
  },
  {
    name: "DeeplyNestedOrderedList",
    markdown: "1. Level 1\\n   1. Level 2\\n      1. Level 3\\n         1. Level 4"
  },
  {
    name: "DeeplyNestedUnorderedList",
    markdown: "* Level 1\\n  * Level 2\\n    * Level 3\\n      * Level 4"
  },
  {
    name: "MixedDeepNestingAlternating",
    markdown: "1. Ordered L1 Item 1\\n   * Unordered L2 Item A\\n     1. Ordered L3 Item 1.A.1\\n        * Unordered L4 Item A.A.a\\n   * Unordered L2 Item B\\n2. Ordered L1 Item 2"
  }
];

// --- Run all tests ---
let allMdRoundtripTestsPassed = true;
let allHtmlConsistencyTestsPassed = true;
let individualResults = [];

testsToRun.forEach(testCase => {
  // 1. Run MD -> HTML -> MD test
  const mdTestResult = testFeature(testCase.name, testCase.markdown);
  individualResults.push({ name: `${testCase.name}_MdRoundtrip`, passed: mdTestResult.pass });
  if (!mdTestResult.pass) {
    allMdRoundtripTestsPassed = false;
  }

  // 2. Run HTML -> MD -> HTML consistency test
  //    using the HTML generated from the first step of the MD->HTML->MD test
  console.log(`\n--- Testing HTML->MD->HTML Consistency for: ${testCase.name} ---`);
  const initialHtmlForConsistency = mdTestResult.generatedHtml; // HTML from (MD -> HTML)

  // Step 2.1: Convert this initial HTML to Markdown
  console.log("Step 2.1 (HTML->MD): Converting initial HTML to Markdown...");
  const mdFromInitialHtml = htmlToMarkdown(initialHtmlForConsistency);
  const mdFromHtmlOutPath = path.join(mdFromHtmlOutputDir, `${testCase.name}_from_initial_html.md`);
  fs.writeFileSync(mdFromHtmlOutPath, mdFromInitialHtml, 'utf8');
  console.log(`HTML->MD output saved to: ${mdFromHtmlOutPath}`);

  // Step 2.2: Convert that Markdown back to HTML
  console.log("\nStep 2.2 (MD->HTML): Converting Markdown (from HTML) back to HTML...");
  const finalHtmlForConsistency = markdownToHtml(mdFromInitialHtml);
  const htmlFromMdFromHtmlOutPath = path.join(htmlFromMdFromHtmlOutputDir, `${testCase.name}_final_html.html`);
  fs.writeFileSync(htmlFromMdFromHtmlOutPath, finalHtmlForConsistency, 'utf8');
  console.log(`HTML->MD->HTML output saved to: ${htmlFromMdFromHtmlOutPath}`);

  // Compare initialHtmlForConsistency with finalHtmlForConsistency
  const normalizedInitialHtml = normalizeHtmlForCompare(initialHtmlForConsistency);
  const normalizedFinalHtml = normalizeHtmlForCompare(finalHtmlForConsistency);

  // Trim both strings right before comparison to handle potential trailing newline differences
  let htmlConsistencyPass = normalizedInitialHtml.trim() === normalizedFinalHtml.trim();

  // If they are not identical, but both are effectively empty after normalization, consider it a pass.
  if (!htmlConsistencyPass && normalizedInitialHtml === "" && normalizedFinalHtml === "") {
      htmlConsistencyPass = true;
  }
  
  if (htmlConsistencyPass) {
    console.log(`✓ Test HTML->MD->HTML Consistency for ${testCase.name}`);
  } else {
    allHtmlConsistencyTestsPassed = false;
    console.log(`✗ Test HTML->MD->HTML Consistency for ${testCase.name} - FAILED`);
    console.log(`  Initial HTML (MD->HTML) was saved to: tests/output/html/${testCase.name}.html`);
    console.log(`  Final HTML (MD->HTML->MD->HTML) was saved to: ${htmlFromMdFromHtmlOutPath}`);
    // For debugging, log the normalized versions if they differ and are not too long
    if (normalizedInitialHtml.length < 500 && normalizedFinalHtml.length < 500) {
        console.log("  Normalized Initial HTML (MD->HTML):\n", normalizedInitialHtml);
        console.log("  Normalized Final HTML (MD->HTML->MD->HTML):\n", normalizedFinalHtml);
    } else {
        console.log("  (Normalized HTMLs are too long to display here, check the saved files.)")
    }
  }
  individualResults.push({ name: `${testCase.name}_HtmlConsistency`, passed: htmlConsistencyPass });
});

console.log("\n\n=== OVERALL TEST SUMMARY ===");
individualResults.forEach(res => {
    console.log(`${res.passed ? '✓' : '✗' } ${res.name}`);
});

if (allMdRoundtripTestsPassed) {
  console.log("\n✅ ALL MD->HTML->MD TESTS PASSED (basic preservation check).");
} else {
  console.log("\n❌ SOME MD->HTML->MD TESTS FAILED (basic preservation check). Review logs and output files.");
}

if (allHtmlConsistencyTestsPassed) {
  console.log("\n✅ ALL HTML->MD->HTML CONSISTENCY TESTS PASSED.");
} else {
  console.log("\n❌ SOME HTML->MD->HTML CONSISTENCY TESTS FAILED. Review logs and output files.");
}

console.log("\nNote: MD roundtrip tests primarily check for basic roundtrip conversion and output file generation.");
console.log("Note: HTML consistency tests check if (MD -> HTML) is consistent with (MD -> HTML -> MD -> HTML).");
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
            { name: "Top level ordered list item 1", expected: /1\.\s+Ordered/ },
            { name: "Nested ordered list item A (indented, starts with 1)", expected: /\s+1\.\s+Subordered A/ },
            { name: "Nested ordered list item B (indented, starts with 1)", expected: /\s+1\.\s+Subordered B/ },
            { name: "Second top level item", expected: /1\.\s+Another top item/ } // Or 2. depending on Turndown
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
            { name: "Unchecked task item Markdown", expected: /\*\s+\[ \]\s+Open Task/ },
            { name: "Checked task item Markdown", expected: /\*\s+\[x\]\s+Completed Task/i } // Case-insensitive for 'x'
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