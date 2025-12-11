/**
 * Aegis API Server
 * GraphQL + REST API for evidence ingestion, policy enforcement, and compliance management
 */

import 'reflect-metadata'; // Required for type-graphql
import { initializeDatabase } from '@aegis/db';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';

import { logger } from './utils/logger';
import evidenceRoutes from './routes/evidence.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { createApolloServer } from './graphql/server';

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

// API Info endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    name: 'Aegis DevSecOps Platform API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      graphql: '/graphql',
      scans: '/api/v1/scans',
      policies: '/api/v1/policies (coming in M2)',
      poam: '/api/v1/poam (coming in M2)',
    },
  });
});

// REST API Routes
app.use('/api/v1/scans', evidenceRoutes);

async function start() {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    await initializeDatabase();
    logger.info('Database connected successfully');

    // Create HTTP server (required for Apollo Server)
    const httpServer = createServer(app);

    // Initialize Apollo GraphQL Server
    logger.info('Initializing GraphQL server...');
    await createApolloServer(app, httpServer);
    logger.info('GraphQL server initialized');

    // 404 handler (must be after all routes including GraphQL)
    app.use(notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Aegis API server running on http://localhost:${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔮 GraphQL playground: http://localhost:${PORT}/graphql`);
      logger.info(`📡 REST API: http://localhost:${PORT}/api/v1/scans`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

void start();
