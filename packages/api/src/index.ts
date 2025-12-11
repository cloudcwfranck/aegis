/**
 * Aegis API Server
 * GraphQL + REST API for evidence ingestion, policy enforcement, and compliance management
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { initializeDatabase } from '@aegis/db';

dotenv.config();

const PORT = process.env['PORT'] ?? 4000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Placeholder routes (will be implemented in M1+)
app.get('/api/v1', (_req, res) => {
  res.json({
    name: 'Aegis DevSecOps Platform API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      graphql: '/graphql (coming in M1)',
      scans: '/api/v1/scans (coming in M1)',
      policies: '/api/v1/policies (coming in M2)',
      poam: '/api/v1/poam (coming in M2)',
    },
  });
});

async function start() {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    await initializeDatabase();
    logger.info('Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Aegis API server running on http://localhost:${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

void start();
