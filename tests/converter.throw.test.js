const fs = require('fs');
const vm = require('vm');
const path = require('path');

test('factory throws when Showdown or Turndown missing (coverage of throw path)', () => {
  const filePath = path.resolve(__dirname, '../src/converter.js');
  let src = fs.readFileSync(filePath, 'utf8');

  // Replace the top-level require lines with undefined bindings but keep line count
  // so coverage maps to the same file/lines. Original file has requires on lines 5-7.
  const lines = src.split('\n');
  lines[4] = "const Showdown = undefined;"; // line 5
  lines[5] = "const TurndownService = undefined;"; // line 6
  lines[6] = "const gfmPlugin = undefined;"; // line 7
  src = lines.join('\n');

  // Prepare a sandbox with minimal module object so module.exports assignment works.
  const sandbox = { module: { exports: {} }, exports: {} };

  // Run the modified source in a VM with the original filename so coverage attributes
  // executed lines back to src/converter.js. The factory call should throw and we
  // catch it to assert the message and avoid failing the test run.
  const script = new vm.Script(src, { filename: filePath });
  let thrown = null;
  try {
    script.runInNewContext(sandbox);
  } catch (err) {
    thrown = err;
  }

  expect(thrown).toBeTruthy();
  expect(thrown.message).toMatch(/Showdown and Turndown/);
});
