import { DataSource } from 'typeorm';
import { join } from 'path';

import * as entities from './entities';

/**
 * TypeORM DataSource configuration
 * Environment variables should be set in .env file
 */

// Determine migration path based on environment
const isProduction = process.env['NODE_ENV'] === 'production';
const migrationPath = isProduction
  ? join(__dirname, 'migrations', '**', '*.js')
  : join(__dirname, '..', 'src', 'migrations', '**', '*.ts');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'] ?? 'aegis',
  password: process.env['DB_PASSWORD'] ?? 'aegis_dev_password',
  database: process.env['DB_NAME'] ?? 'aegis_dev',
  synchronize: false, // Never use synchronize in production - always use migrations
  logging: process.env['NODE_ENV'] === 'development',
  entities: Object.values(entities),
  migrations: [migrationPath],
  subscribers: [],
  ssl: process.env['DB_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();

    // Run pending migrations automatically on startup
    const runMigrations = process.env['RUN_MIGRATIONS'] !== 'false';
    if (runMigrations) {
      console.log('🔄 Checking for pending migrations...');
      const pendingMigrations = await AppDataSource.showMigrations();

      if (pendingMigrations) {
        console.log('🚀 Running pending migrations...');
        const migrations = await AppDataSource.runMigrations({
          transaction: 'all',
        });
        console.log(`✅ Ran ${migrations.length} migration(s)`);
        migrations.forEach((m) => console.log(`  - ${m.name}`));
      } else {
        console.log('✅ Database schema is up to date');
      }
    }
  }
  return AppDataSource;
}
