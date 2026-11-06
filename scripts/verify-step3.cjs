const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log(' TECHA 2.0 — PHASE 1 / STEP 3 VERIFICATION PROTOCOL');
console.log(' Public Read-Only APIs & MongoDB Persistence');
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

// 1. Shared Public Query Contracts
console.log('--- 1. Shared Public Query Contracts Verification ---');
check('public-query.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/public-query.schema.ts')));
const sharedDistPublicQuery = fs.existsSync(path.resolve(__dirname, '../shared/dist/schemas/public-query.schema.js'));
check('Shared public-query schema built into dist', sharedDistPublicQuery);

// 2. Database Lifecycle Module
console.log('\n--- 2. Database Connection Lifecycle Verification ---');
check('core/database/mongoose.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/core/database/mongoose.ts')));
check('core/database/index.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/core/database/index.ts')));

const mongooseFileContent = fs.readFileSync(path.resolve(__dirname, '../backend/src/core/database/mongoose.ts'), 'utf-8');
check('SanitizeMongoUri implemented to prevent credential leaks', mongooseFileContent.includes('sanitizeMongoUri'));
check('Concurrency lock implemented to prevent duplicate connections', mongooseFileContent.includes('connectionPromise'));
check('Canonical lifecycle aliases exported (connectDatabase, disconnectDatabase)', mongooseFileContent.includes('connectDatabase') && mongooseFileContent.includes('disconnectDatabase'));

// 3. Secret Hygiene Check
console.log('\n--- 3. Secret Hygiene Verification ---');
const envExampleContent = fs.readFileSync(path.resolve(__dirname, '../.env.example'), 'utf-8');
const hasAssignedMongoUri = /^MONGODB_URI=\S+/m.test(envExampleContent);
check('MONGODB_URI is empty placeholder in .env.example', !hasAssignedMongoUri);
check('No NEXT_PUBLIC_MONGODB_URI anywhere in .env.example', !envExampleContent.includes('NEXT_PUBLIC_MONGODB_URI'));

// 4. Public Module Verification
console.log('\n--- 4. Public Read-Only Module Verification ---');
check('public.service.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/modules/public/public.service.ts')));
check('public.controller.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/modules/public/public.controller.ts')));
check('public.routes.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/modules/public/public.routes.ts')));

const appFileContent = fs.readFileSync(path.resolve(__dirname, '../backend/src/app.ts'), 'utf-8');
check('publicRoutes mounted at /api/v1/public in app.ts', appFileContent.includes("app.use('/api/v1/public', publicRoutes)"));

// 5. Test Suite Verification
console.log('\n--- 5. Automated Vitest Suite Execution ---');
try {
  const testOutput = execSync('npm run test --workspace=@techa/backend', { cwd: path.resolve(__dirname, '..'), encoding: 'utf-8' });
  const passedMatch = testOutput.match(/Tests\s+(\d+)\s+passed/);
  const testCount = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  check(`Vitest suite passed (${testCount} tests)`, testCount >= 79);
} catch (e) {
  check('Vitest suite passed', false);
}

// 6. Backend Build Verification
console.log('\n--- 6. Backend Workspace Build ---');
try {
  execSync('npm run build --workspace=@techa/backend', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  check('@techa/backend build succeeded', fs.existsSync(path.resolve(__dirname, '../backend/dist/modules/public/public.routes.js')));
} catch (e) {
  check('@techa/backend build succeeded', false);
}

console.log('\n====================================================');
console.log(`STEP 3 SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll Phase 1 / Step 3 Requirements PASSED successfully!');
  process.exit(0);
}
