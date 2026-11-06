const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log(' TECHA 2.0 — PHASE 1 / STEP 2 VERIFICATION PROTOCOL');
console.log(' Greenfield Models & Zod Contracts Architecture');
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

// 1. Zod Contracts & Schemas in @techa/shared
console.log('--- 1. Shared Zod Contracts Verification ---');
check('primitives.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/primitives.schema.ts')));
check('content-blocks.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/content-blocks.schema.ts')));
check('interactive-example.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/interactive-example.schema.ts')));
check('course.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/course.schema.ts')));
check('chapter.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/chapter.schema.ts')));
check('lesson.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/lesson.schema.ts')));
check('media.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/media.schema.ts')));
check('page.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/page.schema.ts')));
check('import-package.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../shared/src/schemas/import-package.schema.ts')));

// Check that no z.any() was used in shared schemas
const sharedSrcDir = path.resolve(__dirname, '../shared/src/schemas');
const schemaFiles = fs.readdirSync(sharedSrcDir);
let hasZAny = false;
for (const file of schemaFiles) {
  const content = fs.readFileSync(path.join(sharedSrcDir, file), 'utf-8');
  if (/z\.any\(\)/.test(content)) {
    hasZAny = true;
    console.error(`Forbidden z.any() found in ${file}`);
  }
}
check('No z.any() found in shared schemas', !hasZAny);

// 2. Mongoose Models in @techa/backend
console.log('\n--- 2. Backend Mongoose Models Verification ---');
check('course.model.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/models/course.model.ts')));
check('chapter.model.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/models/chapter.model.ts')));
check('lesson.model.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/models/lesson.model.ts')));
check('content-block.schema.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/models/content-block.schema.ts')));
check('media-asset.model.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/models/media-asset.model.ts')));
check('site-page.model.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/models/site-page.model.ts')));

// Check that Schema.Types.Mixed is genuinely avoided
const backendModelsDir = path.resolve(__dirname, '../backend/src/models');
const modelFiles = fs.readdirSync(backendModelsDir);
let hasMixed = false;
for (const file of modelFiles) {
  const content = fs.readFileSync(path.join(backendModelsDir, file), 'utf-8');
  if (/Schema\.Types\.Mixed/.test(content)) {
    hasMixed = true;
    console.error(`Forbidden Schema.Types.Mixed found in ${file}`);
  }
}
check('Schema.Types.Mixed genuinely avoided in models', !hasMixed);

// 3. Services Verification
console.log('\n--- 3. Domain Services Verification ---');
check('publication.service.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/services/publication.service.ts')));
check('course-stats.service.ts exists', fs.existsSync(path.resolve(__dirname, '../backend/src/services/course-stats.service.ts')));

// 4. Fixtures Verification
console.log('\n--- 4. Fixtures Verification ---');
check('valid-course-import-package.json exists', fs.existsSync(path.resolve(__dirname, '../backend/test/fixtures/valid-course-import-package.json')));
check('invalid-course-import-packages.json exists', fs.existsSync(path.resolve(__dirname, '../backend/test/fixtures/invalid-course-import-packages.json')));

// 5. Test Suite Execution
console.log('\n--- 5. Automated Vitest Suite Execution ---');
try {
  execSync('npm run test --workspace=@techa/backend', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  check('Vitest test suite passed all tests', true);
} catch (e) {
  check('Vitest test suite passed all tests', false);
}

console.log('\n====================================================');
console.log(`STEP 2 SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll Phase 1 / Step 2 Requirements PASSED successfully!');
  process.exit(0);
}
