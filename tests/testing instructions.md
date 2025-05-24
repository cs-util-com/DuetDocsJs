# Testing Instructions

## Overview
The testing setup validates the bidirectional conversion between Markdown and HTML using the converter functions.

## Test Structure
1. Input files are located in the `tests` directory with `.md` extensions.
2. For each input file, a test case should:
   - Convert the Markdown to HTML (output #1)
   - Convert that HTML back to Markdown (output #2)
   - Compare the final Markdown with the original to validate roundtrip fidelity
3. Both outputs (#1 and #2) are saved to the `tests/output` directory with `.converted.txt` extension
   - The file format should be: original filename + `.converted.txt`
   - The file should contain both the HTML output and the Markdown reconversion, clearly labeled

## Implementation Details

### Directory Structure
```
tests/
  ├── input markdown files (*.md)
  ├── output/           # Generated output files
  └── converter.test.js # Test implementation
```

### Test File Format
Each generated output file should follow this format:
```
--- ORIGINAL MARKDOWN ---
(Contents of the original markdown file)

--- CONVERTED HTML ---
(HTML generated from the markdown)

--- RECONVERTED MARKDOWN ---
(Markdown generated from the HTML)
```

### Running Tests
Run tests using: `npm test` (configured in package.json)

### Passing Criteria
- The reconverted Markdown should match the original Markdown semantically
- Minor whitespace or formatting differences may be acceptable if they don't change the rendered output

## Adding New Tests
1. Add a new markdown file to the `tests` directory
2. Run the tests
3. Examine the output file to verify correct conversion