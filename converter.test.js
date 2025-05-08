const fs = require('fs');
const path = require('path');
const { markdownToHtml, htmlToMarkdown } = require('./converter');

// Read the example markdown file
const exampleMdPath = path.join(__dirname, 'example markdown.md');
const originalMarkdown = fs.readFileSync(exampleMdPath, 'utf8');

console.log("\n=== ROUNDTRIP MARKDOWN CONVERSION TEST ===");
console.log("This test converts markdown to HTML and back to markdown");
console.log("to verify that key elements are preserved.\n");

// Convert Markdown to HTML
console.log("Step 1: Converting Markdown to HTML...");
const generatedHtml = markdownToHtml(originalMarkdown);

// Examine HTML output
console.log("\nHTML Intermediate Output (first 500 characters):");
console.log(generatedHtml.substring(0, 500) + "...");

// *** ADDED: Function to check HTML structure for lists ***
function checkHtmlListStructure(html) {
  const results = [];

  // Expected structure for:
  // 1. Ordered
  //    1. Subordered 0
  //    1. Sub ordered 1
  //    1. Sub ordered 2
  //       1. Sub Sub ordered 1
  const orderedNestedOrderedRegex = /<ol>[\s\S]*?<li.*?>Ordered[\s\S]*?<ol>[\s\S]*?<li>Subordered 0<\/li>[\s\S]*?<li>Sub ordered 1<\/li>[\s\S]*?<li>Sub ordered 2[\s\S]*?<ol>[\s\S]*?<li>Sub Sub ordered 1<\/li>[\s\S]*?<\/ol>[\s\S]*?<\/li>[\s\S]*?<\/ol>[\s\S]*?<\/li>[\s\S]*?<\/ol>/;
  results.push({
    name: 'HTML: Ordered List with Nested Ordered List',
    pass: orderedNestedOrderedRegex.test(html),
    expectedPattern: "<ol><li>Ordered <ol><li>Subordered 0</li><li>Sub ordered 1</li><li>Sub ordered 2 <ol><li>Sub Sub ordered 1</li></ol></li></ol></li></ol>"
  });

  // Expected structure for:
  // 2. Another
  //    * Sub unordered
  //        1. Sub ordered 1
  //        2. Sub ordered 2
  const orderedNestedMixedRegex = /<ol>[\s\S]*?<li.*?>Another[\s\S]*?<ul>[\s\S]*?<li>Sub unordered[\s\S]*?<ol>[\s\S]*?<li>Sub ordered 1<\/li>[\s\S]*?<li>Sub ordered 2<\/li>[\s\S]*?<\/ol>[\s\S]*?<\/li>[\s\S]*?<\/ul>[\s\S]*?<\/li>[\s\S]*?<\/ol>/;
  results.push({
    name: 'HTML: Ordered List with Nested Unordered and further Nested Ordered List',
    pass: orderedNestedMixedRegex.test(html),
    expectedPattern: "<ol><li>Another <ul><li>Sub unordered <ol><li>Sub ordered 1</li><li>Sub ordered 2</li></ol></li></ul></li></ol>"
  });

  // Expected structure for bullet list
  // * Bullet
  // * Bullet
  // - Also Bullet (becomes * Also Bullet)
  // - Also Bullet (becomes * Also Bullet)
  const bulletListRegex = /<ul>[\s\S]*?<li>Bullet<\/li>[\s\S]*?<li>Bullet<\/li>[\s\S]*?<li>Also Bullet<\/li>[\s\S]*?<li>Also Bullet<\/li>[\s\S]*?<\/ul>/;
  results.push({
    name: 'HTML: Bullet List Structure',
    pass: bulletListRegex.test(html),
    expectedPattern: "<ul><li>Bullet</li><li>Bullet</li><li>Also Bullet</li><li>Also Bullet</li></ul>"
  });

  // Expected structure for task list
  // * [ ] Task Open
  // * [x] Task Done
  const taskListHtmlRegex = new RegExp(
    '<ul[^>]*>' +                                                              // Match <ul> with any attributes
    '[\\s\\S]*?' +                                                             // Match any characters non-greedily (including newlines)
    '<li[^>]*class="task-list-item"[^>]*>' +                                   // Match <li class="task-list-item" ...>
    '[\\s\\S]*?' +
    '<input[^>]*type="checkbox"[^>]*\\bdisabled\\b(?![^>]*\\bchecked\\b)[^>]*>' + // Match <input type="checkbox" ... disabled (and not checked) ...>
    '[\\s\\S]*?Task Open[\\s\\S]*?<\\/li>' +                                    // Match Task Open text and closing </li>
    '[\\s\\S]*?' +
    '<li[^>]*class="task-list-item"[^>]*>' +                                   // Match another <li class="task-list-item" ...>
    '[\\s\\S]*?' +
    '<input[^>]*type="checkbox"[^>]*\\bdisabled\\b[^>]*\\bchecked\\b[^>]*>' +   // Match <input type="checkbox" ... disabled ... checked ...>
    '[\\s\\S]*?Task Done[\\s\\S]*?<\\/li>' +                                     // Match Task Done text and closing </li>
    '[\\s\\S]*?' +
    '<\\/ul>'                                                                  // Match closing </ul>
  );
  results.push({
    name: 'HTML: Task List Structure',
    pass: taskListHtmlRegex.test(html),
    expectedPattern: "<ul><li...><input type=\"checkbox\" disabled...>Task Open</li><li...><input type=\"checkbox\" disabled checked...>Task Done</li></ul>"
  });

  return results;
}

// *** NEW: More detailed extraction of HTML list structures ***
function extractListStructures(html) {
  // Extract HTML sections for list types to analyze more closely
  const orderedListSection = extractSection(html, '<h4 id="ordered">Ordered</h4>', '<h4 id="bullet">');
  const bulletListSection = extractSection(html, '<h4 id="bullet">Bullet</h4>', '<h4 id="task-list">');
  const taskListSection = extractSection(html, '<h4 id="task-list">Task List</h4>', '<h1 id="escape">');
  
  return {
    orderedListHTML: orderedListSection,
    bulletListHTML: bulletListSection,
    taskListHTML: taskListSection,
  };
}

function extractSection(html, startMarker, endMarker) {
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) return 'Section not found';
  
  const endIndex = html.indexOf(endMarker, startIndex);
  if (endIndex === -1) return html.substring(startIndex); // to the end if end marker not found
  
  return html.substring(startIndex, endIndex);
}

// Convert HTML back to Markdown
console.log("\nStep 2: Converting HTML back to Markdown...");
const roundtripMarkdown = htmlToMarkdown(generatedHtml);

// Write the output files to inspect the differences
fs.writeFileSync('roundtrip-result.md', roundtripMarkdown, 'utf8');
fs.writeFileSync('html-intermediate.html', generatedHtml, 'utf8');
console.log("Generated output files: roundtrip-result.md, html-intermediate.html\n");

// *** NEW: Extract and log HTML list structures for debugging ***
console.log("\nDetailed HTML List Structure Analysis:");
const listStructures = extractListStructures(generatedHtml);
console.log("\n=== Ordered List HTML ===");
console.log(listStructures.orderedListHTML);
console.log("\n=== Bullet List HTML ===");
console.log(listStructures.bulletListHTML);
console.log("\n=== Task List HTML ===");
console.log(listStructures.taskListHTML);

// Simple check for the presence of key elements in the roundtrip output
function checkForKeyElements(originalMd, roundtripMd) {
  // Define expected structures from originalMarkdown for stricter checking
  const expectedOrderedListBlock = `\\
1. Ordered   
   1. Subordered 0
   1. Sub ordered 1
   1. Sub ordered 2
      1. Sub Sub ordered 1
2. Another
    * Sub unordered
        1. Sub ordered 1
        1. Sub ordered 2`;

  const expectedBulletListBlock = `\
* Bullet
* Bullet
- Also Bullet
- Also Bullet`; // Note: Turndown is expected to convert '-' to '*' for consistency.
                           // So the actual check will be for '*'

  const expectedTaskListBlock = `\
* [ ] Task Open 
* [x] Task Done`;

  const expectedTableBlock = `\
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |    b   |     c |
| d    |    e   |     f |`;

  const expectedFencedCodeBlock = `\
\`\`\`js
console.log('Hi');
\`\`\``;

  const expectedBlockquoteBlock = `\
> Quote
> 
> > Nested`;

  // Helper to create a regex from a multiline string, escaping special chars
  // and making whitespace flexible (to a degree) but structure rigid.
  const createBlockRegex = (blockString) => {
    const escaped = blockString.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'); // Escape regex special chars
    // Replace multiple spaces/tabs with \\s+ for flexibility in spacing within lines,
    // but preserve newlines strictly.
    const regexStr = escaped.replace(/ +/g, '\\\\s+');
    return new RegExp(regexStr.replace(/\\\n/g, '\\n')); // Ensure newlines are literal
  };
  
  const createExactBlockRegex = (blockString) => {
    // Characters that are special in regular expressions
    const metaCharsRegex = /[\\^$.*+?()[\]{}|]/g;
    // Define a literal backslash string. In JS, '\\' becomes a single backslash.
    const literalBackslash = '\\\\'; 
    // The replacement string should be a literal backslash followed by the matched substring ($&).
    const regexSafeReplacement = literalBackslash + '$&';

    // Escape special regex characters
    let escaped = blockString.replace(metaCharsRegex, regexSafeReplacement);
    
    // Normalize line endings to \n for the regex pattern string
    escaped = escaped.replace(/\r\n|\r|\n/g, '\\n');
    
    // Make spaces flexible (allow zero or more whitespace characters for every space)
    escaped = escaped.replace(/ /g, '\\s*'); 
    
    return new RegExp(escaped, 'm'); // 'm' for multiline matching
  };


  const checks = [
    // General Structure & Headers
    { name: 'H1 Header', expected: "# Markdown Examples", actual: roundtripMd.includes("# Markdown Examples") },
    { name: 'H6 Header', expected: "###### Header 6", actual: roundtripMd.includes("###### Header 6") },

    // Rich Text
    { name: 'Bold text', expected: "**Bold**", actual: roundtripMd.includes("**Bold**") },
    { name: 'Italic text', expected: "*Italic*", actual: roundtripMd.includes("*Italic*") },
    { name: 'Strikethrough', expected: "~~Strike~~", actual: roundtripMd.includes("~~Strike~~") },
    { name: 'Del HTML tag', expected: "<del>some html</del>", actual: roundtripMd.includes("<del>some html</del>") },
    
    // Lists - Stricter block checks
    { 
      name: 'Ordered List Structure', 
      expected: expectedOrderedListBlock, 
      actual: createExactBlockRegex(expectedOrderedListBlock).test(roundtripMd),
      info: "Checks for exact ordered list block, including nesting and mixed types."
    },
    { 
      name: 'Bullet List Structure', 
      expected: expectedBulletListBlock.replace(/- Also Bullet/g, '* Also Bullet'), // Test expects '-' to be converted to '*'
      actual: createExactBlockRegex(expectedBulletListBlock.replace(/- Also Bullet/g, '* Also Bullet')).test(roundtripMd),
      info: "Checks for bullet list block. Note: '-' items are expected to be converted to '*'."
    },
    { 
      name: 'Task List Structure', 
      expected: expectedTaskListBlock, 
      actual: createExactBlockRegex(expectedTaskListBlock).test(roundtripMd),
      info: "Checks for task list block with correct markers."
    },

    // Links
    { name: 'Inline Link', expected: "[Inline](https://example.com)", actual: roundtripMd.includes("[Inline](https://example.com)") },
    { name: 'Reference Link Usage', expected: "[Ref link][ref]", actual: roundtripMd.includes("[Ref link][ref]") },
    { name: 'Reference Link Definition', expected: "[ref]: https://example.org", actual: roundtripMd.includes("[ref]: https://example.org") },

    // Images
    { name: 'Inline Image', expected: "![Cat](https://picsum.photos/100)", actual: roundtripMd.includes("![Cat](https://picsum.photos/100)") },
    { name: 'Reference Image', expected: "![Logo][logo]", actual: roundtripMd.includes("![Logo][logo]") },
    { name: 'Clickable Image', expected: "[![Video](https://picsum.photos/120)](https://youtu.be/dQw4w9WgXcQ)", actual: roundtripMd.includes("[![Video](https://picsum.photos/120)](https://youtu.be/dQw4w9WgXcQ)")},

    // Footnotes
    { name: 'Footnote Reference', expected: "Footnote here[^1]", actual: roundtripMd.includes("Footnote here[^1]") },
    { name: 'Footnote Definition', expected: "[^1]: Footnote **supports** markdown.", actual: roundtripMd.includes("[^1]: Footnote **supports** markdown.") },
    
    // Code
    { name: 'Inline code', expected: "`Inline code`", actual: roundtripMd.includes("`Inline code`") },
    { 
      name: 'Fenced Code Block with lang ID', 
      expected: expectedFencedCodeBlock, 
      actual: createExactBlockRegex(expectedFencedCodeBlock).test(roundtripMd),
      info: "Checks for the exact fenced code block."
    },
    
    // Tables
    { 
      name: 'Table Structure', 
      expected: expectedTableBlock, 
      actual: createExactBlockRegex(expectedTableBlock).test(roundtripMd),
      info: "Checks for the exact table structure, including alignment and spacing."
    },

    // Blockquotes
    { 
      name: 'Blockquote Structure', 
      expected: expectedBlockquoteBlock, 
      actual: createExactBlockRegex(expectedBlockquoteBlock).test(roundtripMd),
      info: "Checks for exact blockquote structure, including nesting."
    },
    
    // Inline HTML
    { name: 'KBD tag', expected: "<kbd>Ctrl</kbd> + <kbd>C</kbd>", actual: roundtripMd.includes("<kbd>Ctrl</kbd> + <kbd>C</kbd>") }
  ];
  
  // *** NEW: Additional detailed checks for list conversion ***
  const actualOrderedListSection = extractListMarkdownSection(roundtripMd, '#### Ordered', '#### Bullet');
  const actualBulletListSection = extractListMarkdownSection(roundtripMd, '#### Bullet', '#### Task List');
  const actualTaskListSection = extractListMarkdownSection(roundtripMd, '#### Task List', '# Escape');

  console.log("\n=== Actual Markdown Converted List Sections ===");
  console.log("Ordered List Section:\n" + actualOrderedListSection);
  console.log("\nBullet List Section:\n" + actualBulletListSection);
  console.log("\nTask List Section:\n" + actualTaskListSection);

  // Add specific pattern checks for common list conversion errors
  checks.push({
    name: 'No Consecutive Numbers in Ordered Lists',
    expected: "No consecutive list numbers like '1. item\n2. item'",
    actual: !/(\d+)\.\s+[^\n]+\n\s*(\d+)\.\s+/.test(actualOrderedListSection), 
    // If the above regex matches, we have a flattened list with consecutive numbers
    info: "Checks that ordered lists are not flattened with consecutive numbers."
  });

  // NEW: More specific test for ordered list numbering
  checks.push({
    name: 'Nested Ordered Lists Start with 1',
    expected: "Each nested ordered list should start with 1",
    actual: /1\.\s+Ordered[\s\S]*?1\.\s+Subordered/.test(actualOrderedListSection),
    info: "Checks that nested ordered lists restart numbering with 1."
  });

  // NEW: Test for preserving ordered list numbering in original format
  checks.push({
    name: 'Ordered List Uses Original Markdown Numbering Style',
    expected: "Use same number as in source markdown (typically all 1's)",
    actual: !/2\.\s+Subordered/.test(actualOrderedListSection), // Should use 1. not 2.
    info: "Checks that ordered lists use the same number style as the original markdown."
  });

  checks.push({
    name: 'Preserve List Nesting with Proper Indentation',
    expected: "Indent nested items with spaces, not number sequences",
    actual: /\s{3,}\d+\.|\s{3,}\*\s/.test(actualOrderedListSection),
    // The above checks for proper indentation characters before nested items
    info: "Checks that nested list items are properly indented."
  });

  checks.push({
    name: 'Proper Bullet List Markers',
    expected: "Bullet lists use * or - markers, not numbers",
    actual: !/\d+\.\s+Bullet/.test(actualBulletListSection),
    // If the above regex matches, bullets are incorrectly numbered
    info: "Checks that bullet lists aren't converted to numbered lists."
  });

  checks.push({
    name: 'Preserve Task List Checkboxes',
    expected: "Task lists keep [ ] and [x] syntax",
    actual: /\*\s+\[\s\]|\*\s+\[x\]/.test(actualTaskListSection),
    // The above checks for proper checkbox syntax
    info: "Checks that task list checkboxes are preserved."
  });
  
  const results = checks.map(check => {
    // If 'actual' is already a boolean (from includes or test()), use it directly.
    const pass = typeof check.actual === 'boolean' ? check.actual : false; // Default to false if check.actual wasn't a boolean
    return {
      name: check.name,
      pass: pass,
      expectedValue: check.expected,
      // For regex, 'found' might not be as simple as for 'includes'.
      // We'll rely on the 'pass' status.
      found: pass ? "Found as expected" : "Not found or mismatched",
      info: check.info || ""
    };
  });
  
  return results;
}

// Helper to extract markdown sections for lists
function extractListMarkdownSection(markdown, startMarker, endMarker) {
  const startIndex = markdown.indexOf(startMarker);
  if (startIndex === -1) return 'Section not found';
  
  const endIndex = markdown.indexOf(endMarker, startIndex);
  if (endIndex === -1) return markdown.substring(startIndex); // to the end if end marker not found
  
  return markdown.substring(startIndex, endIndex);
}

const checkResults = checkForKeyElements(originalMarkdown, roundtripMarkdown);

// *** ADDED: Run HTML structure checks ***
const htmlCheckResults = checkHtmlListStructure(generatedHtml);
console.log("\nHTML Structure Check Results:");
let htmlChecksPassed = true;
htmlCheckResults.forEach(result => {
  if (result.pass) {
    console.log(`✓ ${result.name}`);
  } else {
    htmlChecksPassed = false;
    console.log(`✗ ${result.name} - Expected pattern like: ${result.expectedPattern}`);
  }
});
// *** END ADDED CODE ***

// Display results
console.log("\nKey element preservation check (stricter):");
let allPassed = true;
checkResults.forEach(result => {
  if (result.pass) {
    console.log(`✓ ${result.name}`);
  } else {
    allPassed = false;
    console.log(`✗ ${result.name} - Expected to find pattern/substring related to '${result.expectedValue}' but it was not found as expected or structure differs. ${result.info}`);
  }
});

// Visual difference comparison with limited output
console.log("\nVisual sample comparison (truncated):");
const originalLines = originalMarkdown.split('\n').slice(0, 10);
const roundtripLines = roundtripMarkdown.split('\n').slice(0, 10);

console.log("\n== ORIGINAL (first 10 lines) ==");
console.log(originalLines.join("\n"));

console.log("\n== ROUNDTRIP (first 10 lines) ==");
console.log(roundtripLines.join("\n"));

// Check if the roundtrip markdown has proper line breaks
console.log("\nRoundtrip newline analysis:");
console.log(`- Contains newlines: ${roundtripMarkdown.includes('\n')}`);
console.log(`- Number of lines: ${roundtripMarkdown.split('\n').length}`);
console.log(`- First 50 chars: '${roundtripMarkdown.substring(0, 50).replace(/\n/g, '\\n')}'`);

// Overall result
if (allPassed && htmlChecksPassed) { // Modified to include htmlChecksPassed
  console.log("\n✅ OVERALL RESULT: All key elements were preserved, and HTML structure for lists is correct.");
} else {
  console.log("\n❌ OVERALL RESULT: Some checks failed. Review Markdown preservation or HTML structure.");
}

console.log("\nNote: This test checks for the presence of key markdown elements rather than exact string matching.");
console.log("The test output files can be inspected for more detailed comparison.");