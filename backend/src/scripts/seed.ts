import { connectToDatabase, disconnectFromDatabase } from '../core/database/mongoose';
import { seedDatabase } from '../modules/public/seeder.service';
import { logger } from '../core/logger/logger';

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  logger.info(`[CLI Seed] Initiating database seed (force: ${force})...`);

  try {
    await connectToDatabase();
    await seedDatabase(force);
    logger.info('[CLI Seed] Database seeded successfully! Exiting.');
    await disconnectFromDatabase();
    process.exit(0);
  } catch (err) {
    logger.fatal({ err }, '[CLI Seed] Error during database seed');
    await disconnectFromDatabase();
    process.exit(1);
  }
}

main();
