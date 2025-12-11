/**
 * SBOM Parser Worker
 * Processes SBOM data asynchronously to extract package information
 * Supports SPDX 2.3 and CycloneDX formats
 */

import { Worker, Job } from 'bullmq';

import { createRedisConnection, QueueName } from '../config';
import { logger } from '../../utils/logger';

/**
 * Job data for SBOM parsing
 */
export interface SBOMParserJobData {
  evidenceId: string;
  tenantId: string;
  sbom: Record<string, unknown>;
  format: 'spdx' | 'cyclonedx';
}

/**
 * Parsed package information
 */
interface ParsedPackage {
  name: string;
  version: string;
  supplier?: string;
  downloadLocation?: string;
  licenseConcluded?: string;
  licenseDeclared?: string;
  copyrightText?: string;
  purl?: string; // Package URL (purl)
  cpe?: string; // Common Platform Enumeration
}

/**
 * Parse SPDX 2.3 format SBOM
 */
function parseSPDX(sbom: Record<string, unknown>): ParsedPackage[] {
  const packages: ParsedPackage[] = [];

  if (!Array.isArray(sbom['packages'])) {
    logger.warn('SPDX SBOM has no packages array');
    return packages;
  }

  for (const pkg of sbom['packages'] as any[]) {
    const parsedPkg: ParsedPackage = {
      name: pkg['name'] ?? 'unknown',
      version: pkg['versionInfo'] ?? 'unknown',
      supplier: pkg['supplier'],
      downloadLocation: pkg['downloadLocation'],
      licenseConcluded: pkg['licenseConcluded'],
      licenseDeclared: pkg['licenseDeclared'],
      copyrightText: pkg['copyrightText'],
    };

    // Extract PURL from external refs
    if (Array.isArray(pkg['externalRefs'])) {
      const purlRef = pkg['externalRefs'].find(
        (ref: any) => ref['referenceType'] === 'purl'
      );
      if (purlRef) {
        parsedPkg.purl = purlRef['referenceLocator'];
      }

      const cpeRef = pkg['externalRefs'].find(
        (ref: any) =>
          ref['referenceType'] === 'cpe23Type' ||
          ref['referenceType'] === 'cpe22Type'
      );
      if (cpeRef) {
        parsedPkg.cpe = cpeRef['referenceLocator'];
      }
    }

    packages.push(parsedPkg);
  }

  return packages;
}

/**
 * Parse CycloneDX format SBOM
 */
function parseCycloneDX(sbom: Record<string, unknown>): ParsedPackage[] {
  const packages: ParsedPackage[] = [];

  if (!Array.isArray(sbom['components'])) {
    logger.warn('CycloneDX SBOM has no components array');
    return packages;
  }

  for (const component of sbom['components'] as any[]) {
    const parsedPkg: ParsedPackage = {
      name: component['name'] ?? 'unknown',
      version: component['version'] ?? 'unknown',
      supplier: component['supplier']?.['name'],
      purl: component['purl'],
      cpe: component['cpe'],
    };

    // Extract license information
    if (component['licenses'] && Array.isArray(component['licenses'])) {
      const licenses = component['licenses']
        .map((l: any) => l['license']?.['id'] || l['license']?.['name'])
        .filter(Boolean);
      parsedPkg.licenseDeclared = licenses.join(', ');
    }

    packages.push(parsedPkg);
  }

  return packages;
}

/**
 * Process SBOM parsing job
 */
async function processSBOMParser(job: Job<SBOMParserJobData>): Promise<void> {
  const { evidenceId, tenantId, sbom, format } = job.data;

  logger.info('Processing SBOM parser job', {
    jobId: job.id,
    evidenceId,
    tenantId,
    format,
  });

  try {
    // Parse SBOM based on format
    let packages: ParsedPackage[];
    if (format === 'spdx') {
      packages = parseSPDX(sbom);
    } else if (format === 'cyclonedx') {
      packages = parseCycloneDX(sbom);
    } else {
      throw new Error(`Unsupported SBOM format: ${format}`);
    }

    logger.info(`Parsed ${packages.length} packages from SBOM`, {
      evidenceId,
      packageCount: packages.length,
    });

    // TODO: Store parsed packages in database
    // This would involve creating a Package entity and repository
    // For now, we just log the results

    await job.updateProgress(100);

    logger.info('SBOM parsing completed successfully', {
      jobId: job.id,
      evidenceId,
      packageCount: packages.length,
    });
  } catch (error) {
    logger.error('SBOM parsing failed', {
      jobId: job.id,
      evidenceId,
      error,
    });
    throw error;
  }
}

/**
 * Create and start SBOM parser worker
 */
export function createSBOMParserWorker(): Worker<SBOMParserJobData> {
  const worker = new Worker<SBOMParserJobData>(
    QueueName.SBOM_PARSER,
    processSBOMParser,
    {
      connection: createRedisConnection(),
      concurrency: 5, // Process up to 5 SBOMs concurrently
    }
  );

  worker.on('completed', (job) => {
    logger.info('SBOM parser job completed', {
      jobId: job.id,
      evidenceId: job.data.evidenceId,
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('SBOM parser job failed', {
      jobId: job?.id,
      evidenceId: job?.data.evidenceId,
      error,
    });
  });

  worker.on('error', (error) => {
    logger.error('SBOM parser worker error', { error });
  });

  logger.info('SBOM parser worker started');

  return worker;
}
