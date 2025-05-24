const fs = require('fs');
const path = require('path');

// Use the showdown and turndown libraries for testing as alternatives
// These are already listed in package.json as dependencies
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

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Get all markdown files in the tests/input directory
const inputDir = path.join(__dirname, 'input');
const testFiles = fs.readdirSync(inputDir)
  .filter(file => file.endsWith('.md'));

console.log(`Found ${testFiles.length} test files`);

// Process each test file
let passedTests = 0;
let failedTests = 0;

testFiles.forEach(fileName => {
  console.log(`Testing ${fileName}...`);
  const filePath = path.join(inputDir, fileName);
  const outputPath = path.join(outputDir, `${fileName}.converted.txt`);
  
  try {
    // Read the original markdown
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');
    
    // Convert markdown to HTML
    const html = markdownToHtml(originalMarkdown);
    
    // Convert HTML back to markdown
    const reconvertedMarkdown = htmlToMarkdown(html);
    
    // Create the output file with both conversions
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
    
    // Write the output to file
    fs.writeFileSync(outputPath, output);
    
    // Basic comparison (could be enhanced for semantic comparison)
    // This just checks if the strings are identical after normalizing whitespace
    const normalizedOriginal = originalMarkdown.trim().replace(/\s+/g, ' ');
    const normalizedReconverted = reconvertedMarkdown.trim().replace(/\s+/g, ' ');
    
    if (normalizedOriginal === normalizedReconverted) {
      console.log(`✅ PASS: ${fileName}`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: ${fileName} - Original and reconverted markdown differ`);
      failedTests++;
    }
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    failedTests++;
  }
});

// Report results
console.log('\n--- TEST RESULTS ---');
console.log(`Total tests: ${testFiles.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
