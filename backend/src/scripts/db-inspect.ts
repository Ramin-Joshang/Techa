import 'dotenv/config';
import { inspectDatabase, disconnectFromDatabase } from '../core/database';

async function run(): Promise<void> {
  console.log('='.repeat(70));
  console.log('TECHA 2.0 — PHASE 1: DATABASE INSPECTION (READ-ONLY)');
  console.log('Target: MongoDB Atlas (11 Collections Inspection)');
  console.log('='.repeat(70));

  try {
    const result = await inspectDatabase();

    console.log(`\nStatus: [${result.status}]`);
    console.log(`Connection: ${result.connectionStatus}`);
    if (result.sanitizedUri) {
      console.log(`MongoDB URI: ${result.sanitizedUri}`);
    }
    if (result.databaseName) {
      console.log(`Database Name: ${result.databaseName}`);
    }

    if (result.status === 'BLOCKED') {
      console.log('\n[BLOCKED] Inspection could not connect:');
      console.log(`Reason: ${result.reason}`);
      return;
    }

    if (result.status === 'FAILED') {
      console.error('\n[FAILED] Error during inspection:');
      console.error(result.reason);
      process.exitCode = 1;
      return;
    }

    console.log(`\nExisting Collections Found: ${result.totalCollections}/11`);
    console.log(`Total Indexes: ${result.totalIndexes}`);

    console.log('\n--- Collections Status ---');
    for (const col of result.collections) {
      console.log(`\nCollection: [${col.name}]`);
      console.log(`  Exists in Atlas: ${col.exists ? 'YES' : 'NO'}`);
      console.log(`  Document Count: ${col.documentCount}`);
      console.log(`  Indexes Count: ${col.indexes.length}`);
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
    console.log('Phase 1 Database Inspection Completed.');
    console.log('='.repeat(70));
  } catch (err: any) {
    console.error('[Fatal Error in db-inspect]', err);
    process.exitCode = 1;
  } finally {
    await disconnectFromDatabase();
  }
}

run();
