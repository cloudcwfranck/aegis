#!/usr/bin/env node
/**
 * Standalone Migration Runner for Azure PostgreSQL
 * This script runs migrations directly against the Azure database
 */

const { DataSource } = require('typeorm');
const path = require('path');

// Load entities
const entities = require('./packages/db/dist/entities');

// Azure PostgreSQL connection details
const config = {
  type: 'postgres',
  host: 'aegis-db-server.postgres.database.usgovcloudapi.net',
  port: 5432,
  username: 'aegisadmin',
  password: process.env.DB_PASSWORD || 'AegisSecure2024!',
  database: 'aegis_prod',
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: true,
  entities: Object.values(entities),
  migrations: [path.join(__dirname, 'packages/db/dist/migrations/**/*.js')],
  subscribers: [],
};

async function runMigrations() {
  console.log('🔄 Starting migration process...');
  console.log(`Database: ${config.host}:${config.port}/${config.database}`);

  const dataSource = new DataSource(config);

  try {
    // Initialize data source
    console.log('📡 Connecting to Azure PostgreSQL...');
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Show pending migrations
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      console.log(`📋 Found pending migrations`);
    } else {
      console.log('✅ No pending migrations');
      await dataSource.destroy();
      return;
    }

    // Run migrations
    console.log('🚀 Running migrations...');
    const migrations = await dataSource.runMigrations({
      transaction: 'all', // Run all migrations in a single transaction
    });

    if (migrations.length === 0) {
      console.log('✅ Database is up to date');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }

    // Clean up
    await dataSource.destroy();
    console.log('👋 Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);

    // Try to close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    process.exit(1);
  }
}

// Run migrations
runMigrations();
