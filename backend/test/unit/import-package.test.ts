import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CourseImportPackageSchema } from '@techa/shared';

describe('CourseImportPackageSchema Contract & Fixtures', () => {
  it('validates the realistic valid import package fixture', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/valid-course-import-package.json');
    const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

    const result = CourseImportPackageSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it('rejects all invalid fixtures with appropriate error messages', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/invalid-course-import-packages.json');
    const invalidFixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

    expect(invalidFixtures.length).toBeGreaterThan(0);

    for (const fixture of invalidFixtures) {
      const result = CourseImportPackageSchema.safeParse(fixture.payload);
      expect(result.success, `Fixture "${fixture.name}" should have failed validation`).toBe(false);

      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message).join(' | ');
        expect(errorMessages).toContain(fixture.expectedError);
      }
    }
  });
});
