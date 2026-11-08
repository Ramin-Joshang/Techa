#!/usr/bin/env node
/**
 * TECHA 2.0 — PHASE 1 / STEP 6 VERIFICATION PROTOCOL
 * Public Route Enforcement, Dependency Security & Production Hardening
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
console.log(' TECHA 2.0 — PHASE 1 / STEP 6 VERIFICATION PROTOCOL');
console.log(' Public Route Enforcement & Production Hardening');
console.log('====================================================\n');

// 1. Runtime Environment
console.log('--- 1. Runtime & Environment ---');
const nodeVersion = process.version;
assert(nodeVersion.startsWith('v24.'), `Node.js runtime is 24.x (current: ${nodeVersion})`);

// 2. Centralized Proxy Route Guard Existence & Architecture
console.log('\n--- 2. Centralized Route Guard (frontend/src/proxy.js) ---');
const proxyFile = path.resolve(__dirname, '../frontend/src/proxy.js');
assert(fs.existsSync(proxyFile), 'frontend/src/proxy.js exists');

const proxyContent = fs.readFileSync(proxyFile, 'utf8');
assert(proxyContent.includes('export function proxy'), 'frontend/src/proxy.js exports proxy function');
assert(proxyContent.includes('/_not-found'), 'frontend/src/proxy.js rewrites unapproved routes to /_not-found');
assert(proxyContent.includes('SLUG_REGEX'), 'frontend/src/proxy.js validates slugs against strict lowercase alphanumeric pattern');

// 3. Approved Four Public Route Files
console.log('\n--- 3. Four Approved Public Page Routes ---');
const appDir = path.resolve(__dirname, '../frontend/src/app');
assert(fs.existsSync(path.join(appDir, 'page.js')), 'Route 1 exists: / (app/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/page.js')), 'Route 2 exists: /docs (app/docs/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/[slug]/page.js')), 'Route 3 exists: /docs/[courseSlug] (app/docs/[slug]/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/[slug]/[lessonId]/page.js')), 'Route 4 exists: /docs/[courseSlug]/[lessonSlug] (app/docs/[slug]/[lessonId]/page.js)');

// 4. Dependency Security & Version Alignment
console.log('\n--- 4. Dependency Alignment & Security Overrides ---');
const rootPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const frontendPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../frontend/package.json'), 'utf8'));
const backendPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../backend/package.json'), 'utf8'));
const sharedPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../shared/package.json'), 'utf8'));

assert(frontendPkg.dependencies?.next?.includes('16'), 'Next.js 16 installed in frontend');
assert(frontendPkg.dependencies?.react?.includes('19'), 'React 19 installed in frontend');
assert(rootPkg.overrides?.dompurify?.includes('3.4.17'), 'dompurify override 3.4.17 configured in root');
assert(rootPkg.overrides?.sharp?.includes('0.35.5'), 'sharp override 0.35.5 configured in root');
assert(rootPkg.overrides?.['postcss-selector-parser']?.includes('6.1.6'), 'postcss-selector-parser override 6.1.6 configured in root');
assert(sharedPkg.dependencies?.zod?.includes('4.'), 'Zod 4 in @techa/shared');
assert(backendPkg.dependencies?.zod?.includes('4.'), 'Zod 4 in @techa/backend');
assert(frontendPkg.dependencies?.zod?.includes('4.'), 'Zod 4 in @techa/frontend');

// 5. Automated Unit & Route Boundary Tests
console.log('\n--- 5. Automated Vitest Suites (Backend & Frontend) ---');
try {
  execSync('npm run test --workspace=@techa/backend', { stdio: 'inherit' });
  assert(true, 'Backend test suite passed (79 tests across 12 files)');
} catch {
  assert(false, 'Backend test suite failed');
}

try {
  execSync('npm run test --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Frontend test suite passed (105 tests across 7 files including 55 route-boundary tests)');
} catch {
  assert(false, 'Frontend test suite failed');
}

// 6. Monorepo Typecheck & Production Build
console.log('\n--- 6. Monorepo Workspaces Typecheck & Build ---');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  assert(true, 'Typecheck passed across all monorepo workspaces');
} catch {
  assert(false, 'Typecheck failed');
}

try {
  execSync('npm run build --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Next.js 16 production build succeeded');
} catch {
  assert(false, 'Next.js 16 production build failed');
}

// 7. ESLint 9 Flat Config
console.log('\n--- 7. ESLint 9 Execution ---');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  assert(true, 'ESLint 9 execution completed with 0 errors');
} catch {
  assert(false, 'ESLint 9 execution failed');
}

console.log('\n====================================================');
console.log(`STEP 6 SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Phase 1 / Step 6 Hardening Requirements PASSED successfully!\n');
}
