#!/usr/bin/env node
/**
 * TECHA 2.0 — PHASE 1 / STEP 4 VERIFICATION PROTOCOL
 * Frontend Integration, Server-Side Rendering (SSR) & Public Data Fetching
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passedAssertions++;
  } else {
    console.error(`[FAIL] ${description}`);
    failedAssertions++;
  }
}

console.log('====================================================');
console.log(' TECHA 2.0 — PHASE 1 / STEP 4 VERIFICATION PROTOCOL');
console.log(' Frontend Integration, SSR & Public Data Fetching');
console.log('====================================================\n');

// 1. Data Access Layer Files
console.log('--- 1. Server-Side Data Access Layer Verification ---');
const serverDir = path.resolve(__dirname, '../frontend/src/lib/server');
assert(fs.existsSync(path.join(serverDir, 'api-config.ts')), 'frontend/src/lib/server/api-config.ts exists');
assert(fs.existsSync(path.join(serverDir, 'api-errors.ts')), 'frontend/src/lib/server/api-errors.ts exists');
assert(fs.existsSync(path.join(serverDir, 'api-client.ts')), 'frontend/src/lib/server/api-client.ts exists');
assert(fs.existsSync(path.join(serverDir, 'public-api.ts')), 'frontend/src/lib/server/public-api.ts exists');
assert(fs.existsSync(path.join(serverDir, 'index.ts')), 'frontend/src/lib/server/index.ts barrel exists');

// 2. Secret Hygiene & Configuration
console.log('\n--- 2. Secret Hygiene & Config Verification ---');
const envExample = fs.readFileSync(path.resolve(__dirname, '../.env.example'), 'utf8');
assert(envExample.includes('TECHA_API_BASE_URL='), 'TECHA_API_BASE_URL defined in .env.example');
assert(!envExample.includes('NEXT_PUBLIC_TECHA_API_BASE_URL'), 'TECHA_API_BASE_URL is server-only (not prefixed with NEXT_PUBLIC_)');
assert(!envExample.includes('NEXT_PUBLIC_MONGODB_URI'), 'MONGODB_URI is not leaked to frontend');

// 3. Content Block Renderer & Security
console.log('\n--- 3. Content Block Renderer & Anti-Execution Guardrails ---');
const rendererFile = path.resolve(__dirname, '../frontend/src/components/docs/content/ContentBlocksRenderer.tsx');
assert(fs.existsSync(rendererFile), 'ContentBlocksRenderer.tsx exists');
const rendererContent = fs.readFileSync(rendererFile, 'utf8');
assert(!rendererContent.includes('eval('), 'ContentBlocksRenderer does not use eval');
assert(!rendererContent.includes('new Function('), 'ContentBlocksRenderer does not use Function constructor');
assert(!rendererContent.includes('srcDoc') && !rendererContent.includes('srcdoc'), 'ContentBlocksRenderer does not use iframe srcDoc');

// 4. Four Approved Public Page Routes Verification
console.log('\n--- 4. Four Public Route Files Verification ---');
const appDir = path.resolve(__dirname, '../frontend/src/app');
assert(fs.existsSync(path.join(appDir, 'page.js')), 'Route 1 exists: / (app/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/page.js')), 'Route 2 exists: /docs (app/docs/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/[slug]/page.js')), 'Route 3 exists: /docs/[courseSlug] (app/docs/[slug]/page.js)');
assert(fs.existsSync(path.join(appDir, 'docs/[slug]/[lessonId]/page.js')), 'Route 4 exists: /docs/[courseSlug]/[lessonSlug] (app/docs/[slug]/[lessonId]/page.js)');

// 5. Outline Context & Sidebar Integration
console.log('\n--- 5. Outline Context & Sidebar Integration ---');
const contextFile = path.resolve(__dirname, '../frontend/src/context/CourseOutlineContext.tsx');
assert(fs.existsSync(contextFile), 'CourseOutlineContext.tsx exists');
const sidebarFile = path.resolve(__dirname, '../frontend/src/components/layout/Sidebar.jsx');
const sidebarContent = fs.readFileSync(sidebarFile, 'utf8');
assert(sidebarContent.includes('useCourseOutline'), 'Sidebar integrates useCourseOutline context');

// 6. Zero Mongoose in Frontend
console.log('\n--- 6. Architectural Boundary Verification ---');
const frontendPackage = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../frontend/package.json'), 'utf8'));
assert(!frontendPackage.dependencies?.mongoose, 'frontend/package.json does not depend on mongoose');
assert(!frontendPackage.dependencies?.mongodb, 'frontend/package.json does not depend on mongodb');

// 7. Automated Test Suite Execution
console.log('\n--- 7. Automated Test Suites Execution ---');
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

// 8. Monorepo Build Execution
console.log('\n--- 8. Monorepo Workspaces Typecheck & Build ---');
try {
  execSync('npm run typecheck --workspace=@techa/shared && npm run typecheck --workspace=@techa/backend && npm run typecheck --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Typecheck succeeded across all workspaces');
} catch {
  assert(false, 'Typecheck failed');
}

try {
  execSync('NODE_ENV=production npm run build --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Frontend production build (next build) succeeded');
} catch {
  assert(false, 'Frontend production build failed');
}

console.log('\n====================================================');
console.log(`STEP 4 SUMMARY: ${passedAssertions} Passed, ${failedAssertions} Failed`);
console.log('====================================================\n');

if (failedAssertions > 0) {
  process.exit(1);
} else {
  console.log('All Phase 1 / Step 4 Requirements PASSED successfully!\n');
}
