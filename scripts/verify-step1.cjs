const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log(' TECHA 2.0 — PHASE 1 / STEP 1 VERIFICATION PROTOCOL');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function check(label, condition) {
  if (condition) {
    console.log(`[PASS] ${label}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${label}`);
    failCount++;
  }
}

// 1. Monorepo Workspaces Verification
console.log('--- 1. Structure Verification ---');
check('Root package.json exists', fs.existsSync(path.resolve(__dirname, '../package.json')));
check('Frontend workspace exists', fs.existsSync(path.resolve(__dirname, '../frontend/package.json')));
check('Backend workspace exists', fs.existsSync(path.resolve(__dirname, '../backend/package.json')));
check('Shared workspace exists', fs.existsSync(path.resolve(__dirname, '../shared/package.json')));
check('.env.example exists', fs.existsSync(path.resolve(__dirname, '../.env.example')));
check('.nvmrc exists', fs.existsSync(path.resolve(__dirname, '../.nvmrc')));

// 2. Shared Workspace Build
console.log('\n--- 2. Shared Workspace Build ---');
try {
  execSync('npm run build --workspace=@techa/shared', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  check('@techa/shared build succeeded', fs.existsSync(path.resolve(__dirname, '../shared/dist/index.js')));
} catch (e) {
  check('@techa/shared build succeeded', false);
}

// 3. Backend Tests
console.log('\n--- 3. Backend Test Suite ---');
try {
  execSync('npm run test --workspace=@techa/backend', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  check('@techa/backend test suite passed', true);
} catch (e) {
  check('@techa/backend test suite passed', false);
}

// 4. Backend Build
console.log('\n--- 4. Backend Build ---');
try {
  execSync('npm run build --workspace=@techa/backend', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  check('@techa/backend build succeeded', fs.existsSync(path.resolve(__dirname, '../backend/dist/server.js')));
} catch (e) {
  check('@techa/backend build succeeded', false);
}

console.log('\n====================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll Step 1 Foundation Checks PASSED successfully!');
  process.exit(0);
}
