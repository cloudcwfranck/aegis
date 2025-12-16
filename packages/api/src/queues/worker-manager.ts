/**
 * Worker Manager
 * Manages lifecycle of all BullMQ workers
 */

import { Worker } from 'bullmq';

import { createPOAMGeneratorWorker } from './workers/poam-generator.worker';
import { createSBOMParserWorker } from './workers/sbom-parser.worker';
import { createVulnerabilityIndexerWorker } from './workers/vulnerability-indexer.worker';
import { logger } from '../utils/logger';

let workers: Worker[] = [];

/**
 * Start all workers
 */
export async function startWorkers(): Promise<void> {
  try {
    logger.info('Starting BullMQ workers...');

    const sbomParserWorker = createSBOMParserWorker();
    const vulnerabilityIndexerWorker = createVulnerabilityIndexerWorker();
    const poamGeneratorWorker = createPOAMGeneratorWorker();

    workers = [
      sbomParserWorker,
      vulnerabilityIndexerWorker,
      poamGeneratorWorker,
    ];

    logger.info('All BullMQ workers started successfully', {
      workerCount: workers.length,
    });
  } catch (error) {
    logger.error('Failed to start workers', { error });
    throw error;
  }
}

/**
 * Stop all workers gracefully
 */
export async function stopWorkers(): Promise<void> {
  try {
    logger.info('Stopping BullMQ workers...');

    await Promise.all(workers.map((worker) => worker.close()));

    workers = [];

    logger.info('All BullMQ workers stopped successfully');
  } catch (error) {
    logger.error('Failed to stop workers', { error });
    throw error;
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down workers gracefully');
  await stopWorkers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down workers gracefully');
  await stopWorkers();
  process.exit(0);
});
