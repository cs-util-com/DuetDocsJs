// tests/unit/isolated/run-isolated.js
// Simple runner to require and execute all isolated unit tests
const fs = require('fs');
const path = require('path');

function runTests(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      runTests(fullPath);
    } else if (file.endsWith('.test.js')) {
      require(fullPath);
    }
  });
}

console.log('Running isolated unit tests...');
runTests(__dirname);
console.log('Done.');
