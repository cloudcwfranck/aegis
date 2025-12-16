#!/usr/bin/env node
/**
 * Migration Runner Script
 * Runs pending TypeORM migrations on the database
 */

import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function runMigrations() {
  console.log('🔄 Starting migration process...');
  console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`Database: ${process.env['DB_HOST']}:${process.env['DB_PORT']}/${process.env['DB_NAME']}`);

  try {
    // Initialize data source
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Show pending migrations
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      console.log(`📋 Found pending migrations`);
    } else {
      console.log('✅ No pending migrations');
      await AppDataSource.destroy();
      return;
    }

    // Run migrations
    console.log('🚀 Running migrations...');
    const migrations = await AppDataSource.runMigrations({
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
    await AppDataSource.destroy();
    console.log('👋 Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);

    // Try to close connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit(1);
  }
}

// Run migrations
runMigrations();
