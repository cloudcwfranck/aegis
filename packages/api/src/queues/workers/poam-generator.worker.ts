/**
 * POA&M Generator Worker
 * Generates Plan of Action and Milestones (POA&M) items from vulnerabilities
 * Creates remediation plans for Critical and High severity findings
 */

import { Worker, Job } from 'bullmq';
import { In } from 'typeorm';

import { AppDataSource } from '@aegis/db/src/data-source';
import { POAMEntity, VulnerabilityEntity } from '@aegis/db/src/entities';
import { VulnerabilitySeverity, POAMStatus } from '@aegis/shared';
import { logger } from '../../utils/logger';
import { createRedisConnection, QueueName } from '../config';

/**
 * Job data for POA&M generation
 */
export interface POAMGeneratorJobData {
  evidenceId: string;
  tenantId: string;
  projectName: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

/**
 * Calculate scheduled completion date based on severity
 * FedRAMP requirements:
 * - Critical: 30 days
 * - High: 90 days
 * - Medium: 180 days
 * - Low: 365 days
 */
function calculateScheduledCompletion(severity: VulnerabilitySeverity): Date {
  const now = new Date();
  const daysMap: Record<VulnerabilitySeverity, number> = {
    [VulnerabilitySeverity.CRITICAL]: 30,
    [VulnerabilitySeverity.HIGH]: 90,
    [VulnerabilitySeverity.MEDIUM]: 180,
    [VulnerabilitySeverity.LOW]: 365,
    [VulnerabilitySeverity.NEGLIGIBLE]: 365,
    [VulnerabilitySeverity.UNKNOWN]: 365,
  };

  const days = daysMap[severity];
  const scheduledDate = new Date(now);
  scheduledDate.setDate(scheduledDate.getDate() + days);

  return scheduledDate;
}

/**
 * Generate remediation steps based on vulnerability severity
 */
function generateRemediationSteps(
  cveId: string,
  packageName: string,
  fixedVersion: string | undefined,
  severity: VulnerabilitySeverity
): string {
  const steps: string[] = [];

  if (
    severity === VulnerabilitySeverity.CRITICAL ||
    severity === VulnerabilitySeverity.HIGH
  ) {
    steps.push(`1. Analyze ${cveId} in ${packageName}`);
    if (fixedVersion) {
      steps.push(`2. Upgrade ${packageName} to version ${fixedVersion}`);
    } else {
      steps.push(`2. Investigate mitigations or workarounds`);
    }
    steps.push(`3. Test application functionality`);
    steps.push(`4. Re-scan to verify remediation`);
    steps.push(`5. Update security documentation`);
  } else {
    steps.push(`1. Review ${cveId} impact`);
    if (fixedVersion) {
      steps.push(`2. Schedule upgrade to ${fixedVersion} in sprint`);
    } else {
      steps.push(`2. Determine remediation approach`);
    }
    steps.push(`3. Apply fix during regular release cycle`);
  }

  return steps.join('\n');
}

/**
 * Process POA&M generation job
 */
async function processPOAMGenerator(
  job: Job<POAMGeneratorJobData>
): Promise<void> {
  const { evidenceId, tenantId, projectName } = job.data;

  logger.info('Processing POA&M generator job', {
    jobId: job.id,
    evidenceId,
    tenantId,
    projectName,
  });

  try {
    // Query Critical and High vulnerabilities from the database
    const vulnRepo = AppDataSource.getRepository(VulnerabilityEntity);
    const poamRepo = AppDataSource.getRepository(POAMEntity);

    const vulnerabilities = await vulnRepo.find({
      where: {
        evidenceId,
        severity: In([
          VulnerabilitySeverity.CRITICAL,
          VulnerabilitySeverity.HIGH,
        ]),
      },
    });

    logger.info('Found vulnerabilities requiring POA&M', {
      evidenceId,
      vulnerabilityCount: vulnerabilities.length,
    });

    if (vulnerabilities.length === 0) {
      logger.info(
        'No Critical or High vulnerabilities found, skipping POA&M generation'
      );
      await job.updateProgress(100);
      return;
    }

    // Create individual POA&M items for each Critical/High vulnerability
    const poamEntities = vulnerabilities.map((vuln) => {
      const dueDate = calculateScheduledCompletion(vuln.severity);
      const remediationSteps = generateRemediationSteps(
        vuln.cveId,
        vuln.packageName,
        vuln.fixedVersion,
        vuln.severity
      );

      return {
        tenantId,
        vulnerabilityId: vuln.id,
        title: `${vuln.cveId} in ${vuln.packageName}@${vuln.packageVersion}`,
        description: vuln.description,
        riskLevel: vuln.severity,
        status: POAMStatus.OPEN,
        dueDate,
        remediationSteps,
        affectedSystems: [projectName],
        metadata: {
          evidenceId,
          cvssScore: vuln.cvssScore,
          cvssVector: vuln.cvssVector,
          fixedVersion: vuln.fixedVersion,
        },
      };
    });

    // Batch insert all POA&M items
    await poamRepo
      .createQueryBuilder()
      .insert()
      .into(POAMEntity)
      .values(poamEntities)
      .execute();

    logger.info(`Created ${poamEntities.length} POA&M items in database`, {
      evidenceId,
      critical: poamEntities.filter(
        (p) => p.riskLevel === VulnerabilitySeverity.CRITICAL
      ).length,
      high: poamEntities.filter(
        (p) => p.riskLevel === VulnerabilitySeverity.HIGH
      ).length,
    });

    await job.updateProgress(100);

    logger.info('POA&M generation completed successfully', {
      jobId: job.id,
      evidenceId,
      poamCount: poamEntities.length,
    });
  } catch (error) {
    logger.error('POA&M generation failed', {
      jobId: job.id,
      evidenceId,
      error,
    });
    throw error;
  }
}

/**
 * Create and start POA&M generator worker
 */
export function createPOAMGeneratorWorker(): Worker<POAMGeneratorJobData> {
  const worker = new Worker<POAMGeneratorJobData>(
    QueueName.POAM_GENERATOR,
    processPOAMGenerator,
    {
      connection: createRedisConnection(),
      concurrency: 10, // POA&M generation is lightweight
    }
  );

  worker.on('completed', (job) => {
    logger.info('POA&M generator job completed', {
      jobId: job.id,
      evidenceId: job.data.evidenceId,
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('POA&M generator job failed', {
      jobId: job?.id,
      evidenceId: job?.data.evidenceId,
      error,
    });
  });

  worker.on('error', (error) => {
    logger.error('POA&M generator worker error', { error });
  });

  logger.info('POA&M generator worker started');

  return worker;
}
