import { describe, it, expect } from 'vitest';
import {
  TARGET_COLLECTION_REGISTRY,
  TARGET_COLLECTIONS,
  provisionDatabase,
  inspectDatabase,
  sanitizeMongoUri,
} from '../../src/core/database';

describe('Phase 1 — Provisioning & Infrastructure Logic', () => {
  it('TARGET_COLLECTION_REGISTRY contains all 11 collections with models', () => {
    expect(Object.keys(TARGET_COLLECTION_REGISTRY).length).toBe(11);
    for (const collName of TARGET_COLLECTIONS) {
      const meta = TARGET_COLLECTION_REGISTRY[collName];
      expect(meta).toBeDefined();
      expect(meta.name).toBe(collName);
      expect(meta.model).toBeDefined();
      expect(meta.description).toBeTruthy();
    }
  });

  it('sanitizeMongoUri masks credentials safely', () => {
    const raw = 'mongodb+srv://adminUser:SecretPass123@cluster0.abcde.mongodb.net/techa_db?retryWrites=true';
    const sanitized = sanitizeMongoUri(raw);
    expect(sanitized).not.toContain('adminUser');
    expect(sanitized).not.toContain('SecretPass123');
    expect(sanitized).toContain('//***:***@cluster0.abcde.mongodb.net/techa_db?retryWrites=true');
  });

  it('provisionDatabase returns BLOCKED without throwing when MONGODB_URI is missing', async () => {
    const result = await provisionDatabase({ uriOverride: '' });
    expect(result.status).toBe('BLOCKED');
    expect(result.connectionStatus).toBe('missing_uri');
    expect(result.reason).toContain('MONGODB_URI');
  });

  it('inspectDatabase returns BLOCKED without mutating when MONGODB_URI is missing', async () => {
    const result = await inspectDatabase({ uriOverride: '' });
    expect(result.status).toBe('BLOCKED');
    expect(result.connectionStatus).toBe('missing_uri');
  });
});
