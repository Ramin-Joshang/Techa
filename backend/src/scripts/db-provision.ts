import 'dotenv/config';
import { provisionDatabase, disconnectFromDatabase } from '../core/database';

async function run(): Promise<void> {
  console.log('='.repeat(70));
  console.log('TECHA 2.0 — PHASE 1: DATABASE PROVISIONING');
  console.log('Target: MongoDB Atlas (11 Greenfield Collections & Indexes)');
  console.log('='.repeat(70));

  try {
    const result = await provisionDatabase();

    console.log(`\nStatus: [${result.status}]`);
    console.log(`Connection: ${result.connectionStatus}`);
    if (result.sanitizedUri) {
      console.log(`MongoDB URI: ${result.sanitizedUri}`);
    }
    if (result.databaseName) {
      console.log(`Database Name: ${result.databaseName}`);
    }

    if (result.status === 'BLOCKED') {
      console.log('\n[BLOCKED] Provisioning was not executed:');
      console.log(`Reason: ${result.reason}`);
      console.log('To provision on MongoDB Atlas, please set MONGODB_URI in your environment.');
      return;
    }

    if (result.status === 'FAILED') {
      console.error('\n[FAILED] Error during provisioning:');
      console.error(result.reason);
      process.exitCode = 1;
      return;
    }

    console.log(`\nSuccessfully Provisioned Collections: ${result.totalCollections}/11`);
    console.log(`Total Active Indexes: ${result.totalIndexes}`);
    if (result.defaultSettingsCreated) {
      console.log('Initialized default global site settings document.');
    }

    console.log('\n--- Collections & Indexes Summary ---');
    for (const col of result.collections) {
      console.log(`\nCollection: [${col.name}]`);
      console.log(`  Description: ${col.description}`);
      console.log(`  Exists: ${col.exists ? 'YES' : 'NO'}`);
      console.log(`  Document Count: ${col.documentCount}`);
      console.log(`  Indexes (${col.indexes.length}):`);
      col.indexes.forEach((idx) => {
        const flags = [
          idx.unique ? 'UNIQUE' : null,
          idx.expireAfterSeconds !== undefined ? `TTL(${idx.expireAfterSeconds}s)` : null,
        ]
          .filter(Boolean)
          .join(', ');
        console.log(`    - ${idx.name} : ${JSON.stringify(idx.key)} ${flags ? `[${flags}]` : ''}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('Phase 1 Database Provisioning Completed Successfully.');
    console.log('='.repeat(70));
  } catch (err: any) {
    console.error('[Fatal Error in db-provision]', err);
    process.exitCode = 1;
  } finally {
    await disconnectFromDatabase();
  }
}

run();
