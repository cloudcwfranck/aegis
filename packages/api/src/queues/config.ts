/**
 * BullMQ Queue Configuration
 * Centralized configuration for Redis connection and queue instances
 */

import { Queue, QueueOptions } from 'bullmq';
import Redis from 'ioredis';

import { logger } from '../utils/logger';

const REDIS_HOST = process.env['REDIS_HOST'] ?? 'localhost';
const REDIS_PORT = parseInt(process.env['REDIS_PORT'] ?? '6379', 10);
const REDIS_PASSWORD = process.env['REDIS_PASSWORD'];
const REDIS_TLS = process.env['REDIS_TLS'] === 'true';

/**
 * Create Redis connection for BullMQ
 */
export function createRedisConnection(): Redis {
  const redisConfig: any = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(
        `Redis connection retry attempt ${times}, waiting ${delay}ms`
      );
      return delay;
    },
  };

  if (REDIS_PASSWORD) {
    redisConfig.password = REDIS_PASSWORD;
  }

  if (REDIS_TLS) {
    redisConfig.tls = {
      rejectUnauthorized: false,
    };
  }

  const connection = new Redis(redisConfig);

  connection.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  connection.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  return connection;
}

/**
 * Default queue options
 */
export const defaultQueueOptions: QueueOptions = {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

/**
 * Queue names
 */
export enum QueueName {
  SBOM_PARSER = 'sbom-parser',
  VULNERABILITY_INDEXER = 'vulnerability-indexer',
  POAM_GENERATOR = 'poam-generator',
}

/**
 * Create a queue instance
 */
export function createQueue<T = any>(queueName: QueueName): Queue<T> {
  return new Queue<T>(queueName, defaultQueueOptions);
}
