import { DataSource } from 'typeorm';

import * as entities from './entities';

/**
 * TypeORM DataSource configuration
 * Environment variables should be set in .env file
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'] ?? 'aegis',
  password: process.env['DB_PASSWORD'] ?? 'aegis_dev_password',
  database: process.env['DB_NAME'] ?? 'aegis_dev',
  synchronize: process.env['NODE_ENV'] !== 'production',
  logging: process.env['NODE_ENV'] === 'development',
  entities: Object.values(entities),
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  ssl: process.env['DB_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
