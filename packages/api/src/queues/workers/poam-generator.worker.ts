/**
 * POA&M Generator Worker
 * Generates Plan of Action and Milestones (POA&M) items from vulnerabilities
 * Creates remediation plans for Critical and High severity findings
 */

import { Worker, Job } from 'bullmq';

import { createRedisConnection, QueueName } from '../config';
import { logger } from '../../utils/logger';

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
 * POA&M item status
 */
enum POAMStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RISK_ACCEPTED = 'Risk Accepted',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

/**
 * POA&M item
 */
interface POAMItem {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: POAMStatus;
  projectName: string;
  evidenceId: string;
  scheduledCompletionDate?: Date;
  milestones?: string[];
  resources?: string[];
  pointOfContact?: string;
}

/**
 * Calculate scheduled completion date based on severity
 * FedRAMP requirements:
 * - Critical: 30 days
 * - High: 90 days
 * - Medium: 180 days
 * - Low: 365 days
 */
function calculateScheduledCompletion(
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
): Date {
  const now = new Date();
  const daysMap = {
    Critical: 30,
    High: 90,
    Medium: 180,
    Low: 365,
  };

  const days = daysMap[severity];
  const scheduledDate = new Date(now);
  scheduledDate.setDate(scheduledDate.getDate() + days);

  return scheduledDate;
}

/**
 * Generate POA&M items from vulnerability counts
 */
function generatePOAMItems(
  jobData: POAMGeneratorJobData
): POAMItem[] {
  const { evidenceId, projectName, criticalCount, highCount, mediumCount } =
    jobData;
  const items: POAMItem[] = [];

  // Generate POA&M for Critical vulnerabilities
  if (criticalCount > 0) {
    items.push({
      title: `Remediate ${criticalCount} Critical Vulnerabilities in ${projectName}`,
      description: `${criticalCount} critical severity vulnerabilities were identified in ${projectName}. These vulnerabilities pose significant risk and must be remediated within 30 days per FedRAMP requirements.`,
      severity: 'Critical',
      status: POAMStatus.OPEN,
      projectName,
      evidenceId,
      scheduledCompletionDate: calculateScheduledCompletion('Critical'),
      milestones: [
        'Analyze all critical vulnerabilities',
        'Develop remediation plan',
        'Apply patches or mitigations',
        'Verify remediation with re-scan',
        'Update security documentation',
      ],
      resources: [
        'DevSecOps Team',
        'Application Security Team',
        'Development Team',
      ],
      pointOfContact: 'Security Operations Manager',
    });
  }

  // Generate POA&M for High vulnerabilities
  if (highCount > 0) {
    items.push({
      title: `Remediate ${highCount} High Vulnerabilities in ${projectName}`,
      description: `${highCount} high severity vulnerabilities were identified in ${projectName}. These vulnerabilities must be remediated within 90 days per FedRAMP requirements.`,
      severity: 'High',
      status: POAMStatus.OPEN,
      projectName,
      evidenceId,
      scheduledCompletionDate: calculateScheduledCompletion('High'),
      milestones: [
        'Review all high vulnerabilities',
        'Prioritize remediation efforts',
        'Implement fixes or compensating controls',
        'Conduct validation testing',
      ],
      resources: ['DevSecOps Team', 'Development Team'],
      pointOfContact: 'Security Operations Manager',
    });
  }

  // Generate POA&M for Medium vulnerabilities (if count is significant)
  if (mediumCount >= 10) {
    items.push({
      title: `Remediate ${mediumCount} Medium Vulnerabilities in ${projectName}`,
      description: `${mediumCount} medium severity vulnerabilities were identified in ${projectName}. These vulnerabilities should be addressed within 180 days.`,
      severity: 'Medium',
      status: POAMStatus.OPEN,
      projectName,
      evidenceId,
      scheduledCompletionDate: calculateScheduledCompletion('Medium'),
      milestones: [
        'Review medium vulnerabilities',
        'Determine remediation approach',
        'Schedule updates in sprint planning',
        'Apply fixes during regular release cycle',
      ],
      resources: ['Development Team'],
      pointOfContact: 'Development Lead',
    });
  }

  return items;
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
    // Generate POA&M items based on vulnerability counts
    const poamItems = generatePOAMItems(job.data);

    logger.info('POA&M items generated', {
      evidenceId,
      poamCount: poamItems.length,
    });

    // TODO: Store POA&M items in database
    // This would involve creating a POAMItem entity and repository
    // For now, we just log the results

    for (const item of poamItems) {
      logger.info('POA&M item created', {
        title: item.title,
        severity: item.severity,
        scheduledCompletion: item.scheduledCompletionDate,
      });
    }

    await job.updateProgress(100);

    logger.info('POA&M generation completed successfully', {
      jobId: job.id,
      evidenceId,
      poamCount: poamItems.length,
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
