/**
 * Queue Service
 * Provides methods to enqueue jobs to various worker queues
 */

import { Queue } from 'bullmq';

import { createQueue, QueueName } from './config';
import { POAMGeneratorJobData } from './workers/poam-generator.worker';
import { SBOMParserJobData } from './workers/sbom-parser.worker';
import { VulnerabilityIndexerJobData } from './workers/vulnerability-indexer.worker';
import { logger } from '../utils/logger';

export class QueueService {
  private sbomParserQueue: Queue<SBOMParserJobData>;
  private vulnerabilityIndexerQueue: Queue<VulnerabilityIndexerJobData>;
  private poamGeneratorQueue: Queue<POAMGeneratorJobData>;

  constructor() {
    this.sbomParserQueue = createQueue<SBOMParserJobData>(
      QueueName.SBOM_PARSER
    );
    this.vulnerabilityIndexerQueue =
      createQueue<VulnerabilityIndexerJobData>(
        QueueName.VULNERABILITY_INDEXER
      );
    this.poamGeneratorQueue = createQueue<POAMGeneratorJobData>(
      QueueName.POAM_GENERATOR
    );
  }

  /**
   * Enqueue SBOM parsing job
   */
  async enqueueSBOMParsing(
    evidenceId: string,
    tenantId: string,
    sbom: Record<string, unknown>,
    format: 'spdx' | 'cyclonedx' = 'spdx'
  ): Promise<string> {
    try {
      const job = await this.sbomParserQueue.add(
        'parse-sbom',
        {
          evidenceId,
          tenantId,
          sbom,
          format,
        },
        {
          jobId: `sbom-${evidenceId}`,
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      logger.info('SBOM parsing job enqueued', {
        jobId: job.id,
        evidenceId,
      });

      return job.id ?? 'unknown';
    } catch (error) {
      logger.error('Failed to enqueue SBOM parsing job', {
        evidenceId,
        error,
      });
      throw error;
    }
  }

  /**
   * Enqueue vulnerability indexing job
   */
  async enqueueVulnerabilityIndexing(
    evidenceId: string,
    tenantId: string,
    projectName: string,
    vulnerabilities: Record<string, unknown>,
    scanner: 'grype' | 'trivy' | 'other' = 'grype'
  ): Promise<string> {
    try {
      const job = await this.vulnerabilityIndexerQueue.add(
        'index-vulnerabilities',
        {
          evidenceId,
          tenantId,
          projectName,
          vulnerabilities,
          scanner,
        },
        {
          jobId: `vuln-${evidenceId}`,
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      logger.info('Vulnerability indexing job enqueued', {
        jobId: job.id,
        evidenceId,
      });

      return job.id ?? 'unknown';
    } catch (error) {
      logger.error('Failed to enqueue vulnerability indexing job', {
        evidenceId,
        error,
      });
      throw error;
    }
  }

  /**
   * Enqueue POA&M generation job
   */
  async enqueuePOAMGeneration(
    evidenceId: string,
    tenantId: string,
    projectName: string,
    vulnerabilityCounts: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    }
  ): Promise<string> {
    try {
      const job = await this.poamGeneratorQueue.add(
        'generate-poam',
        {
          evidenceId,
          tenantId,
          projectName,
          criticalCount: vulnerabilityCounts.critical,
          highCount: vulnerabilityCounts.high,
          mediumCount: vulnerabilityCounts.medium,
          lowCount: vulnerabilityCounts.low,
        },
        {
          jobId: `poam-${evidenceId}`,
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      logger.info('POA&M generation job enqueued', {
        jobId: job.id,
        evidenceId,
      });

      return job.id ?? 'unknown';
    } catch (error) {
      logger.error('Failed to enqueue POA&M generation job', {
        evidenceId,
        error,
      });
      throw error;
    }
  }

  /**
   * Close all queue connections
   */
  async close(): Promise<void> {
    await Promise.all([
      this.sbomParserQueue.close(),
      this.vulnerabilityIndexerQueue.close(),
      this.poamGeneratorQueue.close(),
    ]);
  }
}
