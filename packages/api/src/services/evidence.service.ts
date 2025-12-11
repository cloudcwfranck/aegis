/**
 * Evidence Service - Business logic for evidence ingestion
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@aegis/db';
import {
  EvidenceEntity,
  VulnerabilityEntity,
  BuildEntity,
  ProjectEntity,
} from '@aegis/db';
import { EvidenceType, SBOMFormat, VulnerabilitySeverity } from '@aegis/shared';
import { StorageService } from './storage.service';
import { QueueService } from './queue.service';
import {
  UploadScanInputDto,
  UploadScanResponse,
  SPDXDocument,
  GrypeScanResults,
} from '../dto/upload-scan.dto';
import { logger } from '../utils/logger';

export class EvidenceService {
  private evidenceRepo: Repository<EvidenceEntity>;
  private vulnerabilityRepo: Repository<VulnerabilityEntity>;
  private buildRepo: Repository<BuildEntity>;
  private projectRepo: Repository<ProjectEntity>;

  constructor(
    private storageService: StorageService,
    private queueService: QueueService
  ) {
    this.evidenceRepo = AppDataSource.getRepository(EvidenceEntity);
    this.vulnerabilityRepo = AppDataSource.getRepository(VulnerabilityEntity);
    this.buildRepo = AppDataSource.getRepository(BuildEntity);
    this.projectRepo = AppDataSource.getRepository(ProjectEntity);
  }

  /**
   * Upload scan results (SBOM + vulnerabilities)
   */
  async uploadScanResults(
    tenantId: string,
    input: UploadScanInputDto
  ): Promise<UploadScanResponse> {
    logger.info('Processing evidence upload', {
      tenantId,
      projectName: input.projectName,
      buildId: input.buildId,
    });

    // 1. Validate SBOM format
    const sbomDoc = this.validateSBOM(input.sbom);

    // 2. Validate Grype scan results
    const scanResults = this.validateGrypeScan(input.vulnerabilities);

    // 3. Find or create project
    const project = await this.findOrCreateProject(tenantId, input.projectName);

    // 4. Create build record
    const build = await this.createBuild(project.id, input);

    // 5. Upload SBOM to S3
    const sbomUpload = await this.storageService.uploadSBOM(
      tenantId,
      project.id,
      build.id,
      JSON.stringify(input.sbom)
    );

    // 6. Upload scan results to S3
    const scanUpload = await this.storageService.uploadScanResults(
      tenantId,
      project.id,
      build.id,
      JSON.stringify(input.vulnerabilities)
    );

    // 7. Create evidence record (SBOM)
    const sbomEvidence = await this.createEvidenceRecord(
      tenantId,
      input.projectName,
      input.buildId,
      build.id,
      input.imageDigest,
      EvidenceType.SBOM,
      SBOMFormat.SPDX_2_3,
      sbomUpload
    );

    // 8. Create evidence record (Vulnerability Scan)
    const scanEvidence = await this.createEvidenceRecord(
      tenantId,
      input.projectName,
      input.buildId,
      build.id,
      input.imageDigest,
      EvidenceType.VULNERABILITY_SCAN,
      undefined,
      scanUpload
    );

    // 9. Enqueue worker job for async processing
    await this.queueService.enqueueEvidenceProcessing({
      evidenceId: sbomEvidence.id,
      scanEvidenceId: scanEvidence.id,
      tenantId,
      sbomDoc,
      scanResults,
    });

    // 10. Calculate summary statistics
    const summary = this.calculateSummary(sbomDoc, scanResults);

    logger.info('Evidence upload completed', {
      tenantId,
      evidenceId: sbomEvidence.id,
      summary,
    });

    return {
      success: true,
      evidenceId: sbomEvidence.id,
      message: 'Evidence uploaded successfully. Processing in background.',
      summary,
    };
  }

  /**
   * Validate SBOM document (SPDX 2.3)
   */
  private validateSBOM(sbom: Record<string, unknown>): SPDXDocument {
    const doc = sbom as SPDXDocument;

    if (!doc.spdxVersion || !doc.spdxVersion.startsWith('SPDX-2.')) {
      throw new Error('Invalid SPDX version. Expected SPDX-2.x');
    }

    if (!doc.packages || !Array.isArray(doc.packages)) {
      throw new Error('SBOM must contain packages array');
    }

    return doc;
  }

  /**
   * Validate Grype scan results
   */
  private validateGrypeScan(scan: Record<string, unknown>): GrypeScanResults {
    const results = scan as GrypeScanResults;

    if (!results.matches || !Array.isArray(results.matches)) {
      throw new Error('Scan results must contain matches array');
    }

    return results;
  }

  /**
   * Find or create project
   */
  private async findOrCreateProject(
    tenantId: string,
    projectName: string
  ): Promise<ProjectEntity> {
    let project = await this.projectRepo.findOne({
      where: { tenantId, name: projectName },
    });

    if (!project) {
      project = this.projectRepo.create({
        tenantId,
        name: projectName,
        description: `Auto-created project for ${projectName}`,
        settings: {},
      });
      await this.projectRepo.save(project);
      logger.info('Created new project', { tenantId, projectName });
    }

    return project;
  }

  /**
   * Create build record
   */
  private async createBuild(
    projectId: string,
    input: UploadScanInputDto
  ): Promise<BuildEntity> {
    const build = this.buildRepo.create({
      projectId,
      buildNumber: input.buildId,
      gitCommitSha: input.gitCommitSha,
      gitBranch: input.gitBranch,
      ciPipelineUrl: input.ciPipelineUrl,
      status: 'SUCCESS',
      metadata: {},
    });

    await this.buildRepo.save(build);
    return build;
  }

  /**
   * Create evidence record
   */
  private async createEvidenceRecord(
    tenantId: string,
    projectName: string,
    buildId: string,
    buildEntityId: string,
    imageDigest: string,
    type: EvidenceType,
    format: SBOMFormat | undefined,
    upload: { s3Uri: string; s3Bucket: string; s3Key: string; sha256: string; sizeBytes: number }
  ): Promise<EvidenceEntity> {
    const evidence = this.evidenceRepo.create({
      tenantId,
      projectName,
      buildId,
      buildEntityId,
      imageDigest,
      type,
      format,
      s3Uri: upload.s3Uri,
      s3Bucket: upload.s3Bucket,
      s3Key: upload.s3Key,
      fileSizeBytes: upload.sizeBytes,
      sha256Checksum: upload.sha256,
      metadata: {},
    });

    await this.evidenceRepo.save(evidence);
    return evidence;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    sbomDoc: SPDXDocument,
    scanResults: GrypeScanResults
  ): UploadScanResponse['summary'] {
    const packageCount = sbomDoc.packages.length;

    const vulnerabilityCount = scanResults.matches.length;

    const criticalCount = scanResults.matches.filter(
      (m) => m.vulnerability.severity === 'Critical'
    ).length;

    const highCount = scanResults.matches.filter(
      (m) => m.vulnerability.severity === 'High'
    ).length;

    const mediumCount = scanResults.matches.filter(
      (m) => m.vulnerability.severity === 'Medium'
    ).length;

    const lowCount = scanResults.matches.filter(
      (m) => m.vulnerability.severity === 'Low' ||
        m.vulnerability.severity === 'Negligible'
    ).length;

    return {
      packageCount,
      vulnerabilityCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    };
  }
}
