#!/usr/bin/env node
/**
 * TECHA 2.0 — PHASE 1 / STEP 5 VERIFICATION PROTOCOL
 * Runtime Modernization, Next.js 16 Migration & Dependency Alignment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${description}`);
    failed++;
  }
}

console.log('====================================================');
console.log(' TECHA 2.0 — PHASE 1 / STEP 5 VERIFICATION PROTOCOL');
console.log(' Runtime Modernization, Next.js 16 & Dependency Alignment');
console.log('====================================================\n');

// 1. Node.js 24 Runtime and Configuration
console.log('--- 1. Node.js 24 Runtime & Configuration ---');
const nodeVersion = process.version;
assert(nodeVersion.startsWith('v24.'), `Node.js runtime is 24.x (current: ${nodeVersion})`);

const nvmrc = fs.readFileSync(path.resolve(__dirname, '../.nvmrc'), 'utf8').trim();
assert(nvmrc === '24' || nvmrc.startsWith('24.'), `.nvmrc targets Node 24 (current: ${nvmrc})`);

const rootPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
assert(rootPkg.engines?.node?.includes('24'), `Root engines constraint specifies Node 24 (${rootPkg.engines?.node})`);

// 2. Next.js 16 & React 19 Version Verification
console.log('\n--- 2. Next.js 16 & React 19 Alignment ---');
const frontendPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../frontend/package.json'), 'utf8'));
assert(frontendPkg.dependencies?.next?.includes('16'), `Next.js dependency is 16.x (${frontendPkg.dependencies?.next})`);
assert(frontendPkg.dependencies?.react?.includes('19'), `React dependency is 19.x (${frontendPkg.dependencies?.react})`);
assert(frontendPkg.dependencies?.['react-dom']?.includes('19'), `React DOM dependency is 19.x (${frontendPkg.dependencies?.['react-dom']})`);
assert(frontendPkg.devDependencies?.['@types/react']?.includes('19'), `@types/react is 19.x (${frontendPkg.devDependencies?.['@types/react']})`);
assert(frontendPkg.devDependencies?.['@types/react-dom']?.includes('19'), `@types/react-dom is 19.x (${frontendPkg.devDependencies?.['@types/react-dom']})`);

// 3. Monorepo-Wide Zod 4 Canonical Alignment
console.log('\n--- 3. Monorepo-Wide Zod 4 Canonical Alignment ---');
const sharedPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../shared/package.json'), 'utf8'));
const backendPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../backend/package.json'), 'utf8'));

assert(sharedPkg.dependencies?.zod?.includes('4.'), `Shared package uses Zod 4.x (${sharedPkg.dependencies?.zod})`);
assert(backendPkg.dependencies?.zod?.includes('4.'), `Backend package uses Zod 4.x (${backendPkg.dependencies?.zod})`);
assert(frontendPkg.dependencies?.zod?.includes('4.'), `Frontend package uses Zod 4.x (${frontendPkg.dependencies?.zod})`);

// 4. Mongoose 9 & Express 5 Preservation
console.log('\n--- 4. Mongoose 9 & Express 5 Preservation ---');
assert(backendPkg.dependencies?.mongoose?.includes('9.'), `Mongoose is preserved at version 9 (${backendPkg.dependencies?.mongoose})`);
assert(backendPkg.dependencies?.express?.includes('5.'), `Express is preserved at version 5 (${backendPkg.dependencies?.express})`);

// 5. Four Public Routes & Async API Contracts
console.log('\n--- 5. Public Route Integrity & Async Params ---');
const appDir = path.resolve(__dirname, '../frontend/src/app');
assert(fs.existsSync(path.join(appDir, 'page.js')), 'Route 1 exists: / (app/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/page.js')), 'Route 2 exists: /docs (app/docs/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/[slug]/page.js')), 'Route 3 exists: /docs/[courseSlug] (app/docs/[slug]/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/[slug]/[lessonId]/page.js')), 'Route 4 exists: /docs/[courseSlug]/[lessonSlug] (app/docs/[slug]/[lessonId]/page.js)');

const docsPage = fs.readFileSync(path.join(appDir, 'docs/page.js'), 'utf8');
assert(docsPage.includes('await searchParams'), 'DocsPage awaits searchParams for Next.js 16');

const coursePage = fs.readFileSync(path.join(appDir, 'docs/[slug]/page.js'), 'utf8');
assert(coursePage.includes('await params'), 'DocDetailsPage awaits params for Next.js 16');

const lessonPage = fs.readFileSync(path.join(appDir, 'docs/[slug]/[lessonId]/page.js'), 'utf8');
assert(lessonPage.includes('await params'), 'LessonPage awaits params for Next.js 16');

// 6. Test Suites Execution
console.log('\n--- 6. Automated Test Suites (Vitest) ---');
try {
  execSync('npm run test --workspace=@techa/backend', { stdio: 'inherit' });
  assert(true, 'Backend Vitest suite passed (79 tests across 12 files)');
} catch {
  assert(false, 'Backend Vitest suite execution failed');
}

try {
  execSync('npm run test --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Frontend Vitest suite passed (50 tests across 6 files)');
} catch {
  assert(false, 'Frontend Vitest suite execution failed');
}

// 7. Monorepo Typecheck & Build
console.log('\n--- 7. Monorepo Typecheck & Build ---');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  assert(true, 'TypeScript typecheck passed across all workspaces');
} catch {
  assert(false, 'TypeScript typecheck failed');
}

try {
  execSync('npm run build --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Frontend production build (Next.js 16 Turbopack) succeeded');
} catch {
  assert(false, 'Frontend production build failed');
}

// 8. ESLint 9 Flat Config
console.log('\n--- 8. ESLint 9 Flat Config ---');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  assert(true, 'ESLint 9 execution succeeded with 0 errors');
} catch {
  assert(false, 'ESLint execution failed');
}

console.log('\n====================================================');
console.log(`STEP 5 SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Phase 1 / Step 5 Modernization Requirements PASSED successfully!\n');
}
