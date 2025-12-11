/**
 * Aegis Workers
 * Background workers for evidence processing using BullMQ
 * Implementation will be completed in M1
 */

import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

async function start() {
  logger.info('🔧 Aegis Workers starting...');
  logger.info('Workers will be implemented in M1: Evidence processing');
  logger.info('Planned workers:');
  logger.info('  - SBOM Parser Worker (parse SPDX/CycloneDX)');
  logger.info('  - Vulnerability Indexer Worker (index CVEs)');
  logger.info('  - POA&M Generator Worker (create POA&M items)');
  logger.info('  - Policy Evaluator Worker (run OPA policies)');

  // Placeholder for worker initialization
  // Will implement in M1
}

void start();
