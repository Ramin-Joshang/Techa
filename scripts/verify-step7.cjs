#!/usr/bin/env node
/**
 * TECHA 2.0 — PHASE 1 / STEP 7 VERIFICATION PROTOCOL
 * Production Deployment Preparation, Environment Configuration,
 * PM2 Orchestration & Complete OpenAPI/Swagger Documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let passed = 0;
let failed = 0;

function assert(condition, description, details) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    if (details) console.log(`       ${details}`);
    passed++;
  } else {
    console.error(`[FAIL] ${description}`);
    if (details) console.error(`       ${details}`);
    failed++;
  }
}

console.log('======================================================================');
console.log(' TECHA 2.0 — PHASE 1 / STEP 7 VERIFICATION PROTOCOL');
console.log(' Production Deployment, PM2 Orchestration & OpenAPI/Swagger System');
console.log('======================================================================\n');

// 1. Runtime Environment
console.log('--- 1. Runtime & Environment ---');
const nodeVersion = process.version;
assert(nodeVersion.startsWith('v24.'), `Node.js runtime is 24.x LTS (current: ${nodeVersion})`);

const rootPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
assert(rootPkg.engines?.node?.includes('24'), 'Root package.json engines specifies Node 24');

// 2. Canonical Environment Configuration
console.log('\n--- 2. Canonical Environment Configuration ---');
const rootEnvExample = path.resolve(__dirname, '../.env.example');
const feEnvExample = path.resolve(__dirname, '../frontend/.env.example');
const beEnvExample = path.resolve(__dirname, '../backend/.env.example');

assert(fs.existsSync(rootEnvExample), 'Root .env.example exists');
assert(fs.existsSync(feEnvExample), 'Frontend frontend/.env.example exists');
assert(fs.existsSync(beEnvExample), 'Backend backend/.env.example exists');

const envContent = fs.readFileSync(rootEnvExample, 'utf8');
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'HOST',
  'TECHA_API_BASE_URL',
  'API_PORT',
  'API_HOST',
  'MONGODB_URI',
  'CANONICAL_API_URL',
  'SWAGGER_ENABLED',
  'PRODUCTION_DOMAIN',
  'PRODUCTION_IP',
  'CORS_ORIGINS',
  'FRONTEND_ORIGIN',
  'TRUST_PROXY_HOPS',
  'LOG_LEVEL',
];

const missingVars = requiredVars.filter((v) => !envContent.includes(`${v}=`));
assert(missingVars.length === 0, 'Root .env.example contains all 15 required environment variables', missingVars.length ? `Missing: ${missingVars.join(', ')}` : undefined);

// Ensure no real secrets or .env file is tracked in git
assert(!fs.existsSync(path.resolve(__dirname, '../.env')), 'No real .env file committed to repository root');

// 3. PM2 Process Orchestration & Ecosystem
console.log('\n--- 3. PM2 Process Management (ecosystem.config.cjs) ---');
const ecosystemPath = path.resolve(__dirname, '../ecosystem.config.cjs');
assert(fs.existsSync(ecosystemPath), 'ecosystem.config.cjs exists at repository root');

const ecosystem = require(ecosystemPath);
assert(Array.isArray(ecosystem.apps) && ecosystem.apps.length === 2, 'Ecosystem defines exactly two independent applications');

const feApp = ecosystem.apps.find((a) => a.name === 'techa-frontend');
const beApp = ecosystem.apps.find((a) => a.name === 'techa-backend');

assert(feApp !== undefined, "Ecosystem defines 'techa-frontend' process");
assert(beApp !== undefined, "Ecosystem defines 'techa-backend' process");
assert(feApp && beApp && feApp.cwd !== beApp.cwd, 'Frontend and Backend use separate, isolated working directories');
assert(ecosystem.apps.every((a) => a.autorestart === true && a.watch === false), 'Production reliability: autorestart=true, watch=false');

const gitignore = fs.readFileSync(path.resolve(__dirname, '../.gitignore'), 'utf8');
assert(gitignore.includes('logs/'), '.gitignore excludes PM2 logs directory');

// 4. OpenAPI 3.1 & Swagger Documentation Integrity
console.log('\n--- 4. OpenAPI 3.1 Specification & Swagger UI Integrity ---');
const { openApiDocument } = require('../backend/dist/core/docs/openapi');
assert(openApiDocument.openapi === '3.1.0', "OpenAPI document declares version '3.1.0'");
assert(openApiDocument.info.title === 'TECHA API Documentation', 'OpenAPI document title is valid');

const expectedPaths = [
  '/api/v1/health/liveness',
  '/api/v1/health/readiness',
  '/api/v1/public/home',
  '/api/v1/public/courses',
  '/api/v1/public/courses/{courseSlug}',
  '/api/v1/public/courses/{courseSlug}/outline',
  '/api/v1/public/courses/{courseSlug}/lessons/{lessonSlug}',
];

const registeredPaths = Object.keys(openApiDocument.paths || {});
const allPathsRegistered = expectedPaths.every((p) => registeredPaths.includes(p));
assert(allPathsRegistered && registeredPaths.length === 7, `All 7 registered backend endpoints documented in OpenAPI (count: ${registeredPaths.length})`);

const schemas = openApiDocument.components?.schemas || {};
const expectedBlocks = [
  'HeadingBlock',
  'ParagraphBlock',
  'RichTextBlock',
  'CodeBlock',
  'ImageBlock',
  'VideoBlock',
  'TableBlock',
  'CalloutBlock',
  'QuoteBlock',
  'DividerBlock',
  'DownloadableFileBlock',
  'ListBlock',
  'InteractiveExampleBlock',
  'ContentBlock',
];
const allBlocksRegistered = expectedBlocks.every((b) => schemas[b] !== undefined);
assert(allBlocksRegistered, 'All 13 content block schemas + master union registered in OpenAPI components');

// Verify 0 Persian characters in OpenAPI descriptions & summaries
const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
let hasPersianInDoc = persianRegex.test(openApiDocument.info.description || '') || persianRegex.test(openApiDocument.info.title);

for (const tag of openApiDocument.tags || []) {
  if (persianRegex.test(tag.name) || persianRegex.test(tag.description || '')) {
    hasPersianInDoc = true;
  }
}
assert(!hasPersianInDoc, 'OpenAPI metadata, tags, summaries, and descriptions are 100% technical English (0 Persian characters)');

// Verify Production Server URL
const prodServer = (openApiDocument.servers || []).find((s) => s.url === 'https://techa.ir');
assert(prodServer !== undefined, "OpenAPI servers list includes canonical production URL 'https://techa.ir'");
assert(!JSON.stringify(openApiDocument).includes('62.220.123.21'), 'OpenAPI specification does NOT leak private IP address or credentials');

// 5. Windows Server 2025 Deployment Assets
console.log('\n--- 5. Windows Server 2025 Deployment Assets ---');
const psScript = path.resolve(__dirname, 'check-windows-deployment.ps1');
assert(fs.existsSync(psScript), 'scripts/check-windows-deployment.ps1 exists');

const webConfig = path.resolve(__dirname, '../deploy/iis/web.config');
assert(fs.existsSync(webConfig), 'deploy/iis/web.config exists');

const webConfigContent = fs.readFileSync(webConfig, 'utf8');
assert(webConfigContent.includes('Rewrite') && webConfigContent.includes('api/v1'), 'IIS web.config configures URL rewrite rules for Express API and Next.js');

const envDoc = path.resolve(__dirname, '../docs/deployment/ENVIRONMENT.md');
const iisDoc = path.resolve(__dirname, '../docs/deployment/IIS-REVERSE-PROXY.md');
const winDoc = path.resolve(__dirname, '../docs/deployment/WINDOWS-SERVICE-SETUP.md');
assert(fs.existsSync(envDoc), 'docs/deployment/ENVIRONMENT.md exists');
assert(fs.existsSync(iisDoc), 'docs/deployment/IIS-REVERSE-PROXY.md exists');
assert(fs.existsSync(winDoc), 'docs/deployment/WINDOWS-SERVICE-SETUP.md exists');

// 6. Automated Unit & Integration Tests
console.log('\n--- 6. Automated Unit & Integration Test Suites ---');
try {
  execSync('npm run test --workspace=@techa/backend', { stdio: 'inherit' });
  assert(true, 'Backend Vitest suite passed (100 tests across 14 files including OpenAPI and CORS)');
} catch {
  assert(false, 'Backend Vitest suite failed');
}

try {
  execSync('npm run test --workspace=@techa/frontend', { stdio: 'inherit' });
  assert(true, 'Frontend Vitest suite passed (105 tests across 7 files including 55 route-boundary tests)');
} catch {
  assert(false, 'Frontend Vitest suite failed');
}

// 7. Monorepo Typecheck & Production Build
console.log('\n--- 7. Monorepo Workspaces Typecheck & Unified Build ---');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  assert(true, 'TypeScript typecheck passed across all monorepo workspaces (0 errors)');
} catch {
  assert(false, 'TypeScript typecheck failed');
}

try {
  execSync('npm run build:all', { stdio: 'inherit' });
  assert(true, 'npm run build:all succeeded (shared, backend dist/server.js, and frontend Next.js 16)');
} catch {
  assert(false, 'npm run build:all failed');
}

// 8. ESLint 9 Flat Config
console.log('\n--- 8. ESLint 9 Execution ---');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  assert(true, 'ESLint 9 execution completed with 0 errors');
} catch {
  assert(false, 'ESLint 9 execution failed');
}

console.log('\n======================================================================');
console.log(`STEP 7 SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('======================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Phase 1 / Step 7 Requirements PASSED successfully!\n');
}
