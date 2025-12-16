/**
 * Policy Evaluation Service
 * Evaluates OPA/Rego policies against evidence data
 * Supports CVE severity thresholds, SBOM completeness, image provenance
 */


import { AppDataSource } from '@aegis/db/src/data-source';
import {
  EvidenceEntity,
  VulnerabilityEntity,
  PackageEntity,
  PolicyEntity,
  PolicyEvaluationEntity,
} from '@aegis/db/src/entities';
import { PolicyType, VulnerabilitySeverity } from '@aegis/shared';
import { Repository } from 'typeorm';

import { logger } from '../utils/logger';

/**
 * Policy evaluation input
 */
export interface PolicyEvaluationInput {
  evidenceId: string;
  tenantId: string;
  policyIds?: string[]; // If not provided, evaluates all active policies for tenant
}

/**
 * Policy evaluation result
 */
export interface PolicyEvaluationResult {
  policyId: string;
  policyName: string;
  policyType: PolicyType;
  passed: boolean;
  violations: PolicyViolation[];
  message: string;
  evaluatedAt: Date;
}

/**
 * Policy violation details
 */
export interface PolicyViolation {
  severity: VulnerabilitySeverity;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Evidence data for policy evaluation
 */
interface EvidenceData {
  evidence: EvidenceEntity;
  vulnerabilities: VulnerabilityEntity[];
  packages: PackageEntity[];
  vulnerabilityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    negligible: number;
    unknown: number;
  };
}

export class PolicyService {
  private evidenceRepo: Repository<EvidenceEntity>;
  private vulnerabilityRepo: Repository<VulnerabilityEntity>;
  private packageRepo: Repository<PackageEntity>;
  private policyRepo: Repository<PolicyEntity>;
  private policyEvaluationRepo: Repository<PolicyEvaluationEntity>;

  constructor() {
    this.evidenceRepo = AppDataSource.getRepository(EvidenceEntity);
    this.vulnerabilityRepo = AppDataSource.getRepository(VulnerabilityEntity);
    this.packageRepo = AppDataSource.getRepository(PackageEntity);
    this.policyRepo = AppDataSource.getRepository(PolicyEntity);
    this.policyEvaluationRepo = AppDataSource.getRepository(
      PolicyEvaluationEntity
    );
  }

  /**
   * Evaluate policies against evidence
   */
  async evaluatePolicies(
    input: PolicyEvaluationInput
  ): Promise<PolicyEvaluationResult[]> {
    const { evidenceId, tenantId, policyIds } = input;

    logger.info('Starting policy evaluation', {
      evidenceId,
      tenantId,
      policyIds,
    });

    // Load evidence data
    const evidenceData = await this.loadEvidenceData(evidenceId);

    // Load policies to evaluate
    const policies = await this.loadPolicies(tenantId, policyIds);

    if (policies.length === 0) {
      logger.warn('No policies found for evaluation', { tenantId, policyIds });
      return [];
    }

    // Evaluate each policy
    const results: PolicyEvaluationResult[] = [];

    for (const policy of policies) {
      try {
        const result = this.evaluatePolicy(policy, evidenceData);
        results.push(result);

        // Store evaluation result in database
        await this.storeEvaluationResult(evidenceId, result);
      } catch (error) {
        logger.error('Policy evaluation failed', {
          policyId: policy.id,
          policyName: policy.name,
          error,
        });
      }
    }

    logger.info('Policy evaluation completed', {
      evidenceId,
      totalPolicies: policies.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
    });

    return results;
  }

  /**
   * Load evidence data for evaluation
   */
  private async loadEvidenceData(evidenceId: string): Promise<EvidenceData> {
    const evidence = await this.evidenceRepo.findOne({
      where: { id: evidenceId },
      relations: ['vulnerabilities', 'packages'],
    });

    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    const vulnerabilities = await this.vulnerabilityRepo.find({
      where: { evidenceId },
    });

    const packages = await this.packageRepo.find({
      where: { evidenceId },
    });

    // Count vulnerabilities by severity
    const vulnerabilityCounts = {
      critical: vulnerabilities.filter(
        (v) => v.severity === VulnerabilitySeverity.CRITICAL
      ).length,
      high: vulnerabilities.filter(
        (v) => v.severity === VulnerabilitySeverity.HIGH
      ).length,
      medium: vulnerabilities.filter(
        (v) => v.severity === VulnerabilitySeverity.MEDIUM
      ).length,
      low: vulnerabilities.filter(
        (v) => v.severity === VulnerabilitySeverity.LOW
      ).length,
      negligible: vulnerabilities.filter(
        (v) => v.severity === VulnerabilitySeverity.NEGLIGIBLE
      ).length,
      unknown: vulnerabilities.filter(
        (v) => v.severity === VulnerabilitySeverity.UNKNOWN
      ).length,
    };

    return {
      evidence,
      vulnerabilities,
      packages,
      vulnerabilityCounts,
    };
  }

  /**
   * Load policies for evaluation
   */
  private async loadPolicies(
    tenantId: string,
    policyIds?: string[]
  ): Promise<PolicyEntity[]> {
    if (policyIds && policyIds.length > 0) {
      return this.policyRepo.find({
        where: { id: policyIds as any, tenantId, enabled: true },
      });
    }

    // Load all active policies for tenant
    return this.policyRepo.find({
      where: { tenantId, enabled: true },
      order: { priority: 'DESC' },
    });
  }

  /**
   * Evaluate a single policy against evidence data
   */
  private evaluatePolicy(
    policy: PolicyEntity,
    evidenceData: EvidenceData
  ): PolicyEvaluationResult {
    const { vulnerabilityCounts, packages, evidence } = evidenceData;

    const violations: PolicyViolation[] = [];
    let passed = true;

    // Evaluate based on policy type
    switch (policy.type) {
      case PolicyType.CVE_SEVERITY:
        {
          const result = this.evaluateCVESeverity(policy, vulnerabilityCounts);
          passed = result.passed;
          violations.push(...result.violations);
        }
        break;

      case PolicyType.SBOM_COMPLETENESS:
        {
          const result = this.evaluateSBOMCompleteness(policy, packages);
          passed = result.passed;
          violations.push(...result.violations);
        }
        break;

      case PolicyType.IMAGE_PROVENANCE:
        {
          const result = this.evaluateImageProvenance(policy, evidence);
          passed = result.passed;
          violations.push(...result.violations);
        }
        break;

      case PolicyType.ALLOWED_REGISTRIES:
        {
          const result = this.evaluateAllowedRegistries(policy, evidence);
          passed = result.passed;
          violations.push(...result.violations);
        }
        break;

      default:
        logger.warn('Unknown policy type', { policyType: policy.type });
        passed = true; // Skip unknown policy types
    }

    const message = passed
      ? `Policy "${policy.name}" passed`
      : `Policy "${policy.name}" failed with ${violations.length} violation(s)`;

    return {
      policyId: policy.id,
      policyName: policy.name,
      policyType: policy.type,
      passed,
      violations,
      message,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Evaluate CVE severity threshold policy
   */
  private evaluateCVESeverity(
    policy: PolicyEntity,
    vulnerabilityCounts: EvidenceData['vulnerabilityCounts']
  ): { passed: boolean; violations: PolicyViolation[] } {
    const params = policy.parameters as {
      maxCritical?: number;
      maxHigh?: number;
      maxMedium?: number;
      maxLow?: number;
    };

    const violations: PolicyViolation[] = [];

    // Check Critical threshold
    if (
      params.maxCritical !== undefined &&
      vulnerabilityCounts.critical > params.maxCritical
    ) {
      violations.push({
        severity: VulnerabilitySeverity.CRITICAL,
        message: `Critical vulnerabilities (${vulnerabilityCounts.critical}) exceed maximum allowed (${params.maxCritical})`,
        metadata: {
          count: vulnerabilityCounts.critical,
          threshold: params.maxCritical,
        },
      });
    }

    // Check High threshold
    if (
      params.maxHigh !== undefined &&
      vulnerabilityCounts.high > params.maxHigh
    ) {
      violations.push({
        severity: VulnerabilitySeverity.HIGH,
        message: `High vulnerabilities (${vulnerabilityCounts.high}) exceed maximum allowed (${params.maxHigh})`,
        metadata: {
          count: vulnerabilityCounts.high,
          threshold: params.maxHigh,
        },
      });
    }

    // Check Medium threshold
    if (
      params.maxMedium !== undefined &&
      vulnerabilityCounts.medium > params.maxMedium
    ) {
      violations.push({
        severity: VulnerabilitySeverity.MEDIUM,
        message: `Medium vulnerabilities (${vulnerabilityCounts.medium}) exceed maximum allowed (${params.maxMedium})`,
        metadata: {
          count: vulnerabilityCounts.medium,
          threshold: params.maxMedium,
        },
      });
    }

    // Check Low threshold
    if (
      params.maxLow !== undefined &&
      vulnerabilityCounts.low > params.maxLow
    ) {
      violations.push({
        severity: VulnerabilitySeverity.LOW,
        message: `Low vulnerabilities (${vulnerabilityCounts.low}) exceed maximum allowed (${params.maxLow})`,
        metadata: {
          count: vulnerabilityCounts.low,
          threshold: params.maxLow,
        },
      });
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Evaluate SBOM completeness policy
   */
  private evaluateSBOMCompleteness(
    policy: PolicyEntity,
    packages: PackageEntity[]
  ): { passed: boolean; violations: PolicyViolation[] } {
    const params = policy.parameters as {
      minPackages?: number;
      requireLicenses?: boolean;
      requirePurls?: boolean;
    };

    const violations: PolicyViolation[] = [];

    // Check minimum package count
    if (
      params.minPackages !== undefined &&
      packages.length < params.minPackages
    ) {
      violations.push({
        severity: VulnerabilitySeverity.MEDIUM,
        message: `SBOM contains ${packages.length} packages, minimum required is ${params.minPackages}`,
        metadata: {
          packageCount: packages.length,
          minRequired: params.minPackages,
        },
      });
    }

    // Check license information
    if (params.requireLicenses) {
      const packagesWithoutLicense = packages.filter(
        (pkg) => !pkg.licenseConcluded && !pkg.licenseDeclared
      );
      if (packagesWithoutLicense.length > 0) {
        violations.push({
          severity: VulnerabilitySeverity.LOW,
          message: `${packagesWithoutLicense.length} packages missing license information`,
          metadata: {
            packagesWithoutLicense: packagesWithoutLicense.length,
            totalPackages: packages.length,
          },
        });
      }
    }

    // Check PURL information
    if (params.requirePurls) {
      const packagesWithoutPurl = packages.filter((pkg) => !pkg.purl);
      if (packagesWithoutPurl.length > 0) {
        violations.push({
          severity: VulnerabilitySeverity.LOW,
          message: `${packagesWithoutPurl.length} packages missing Package URL (purl)`,
          metadata: {
            packagesWithoutPurl: packagesWithoutPurl.length,
            totalPackages: packages.length,
          },
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Evaluate image provenance policy
   */
  private evaluateImageProvenance(
    policy: PolicyEntity,
    evidence: EvidenceEntity
  ): { passed: boolean; violations: PolicyViolation[] } {
    const params = policy.parameters as {
      requireImageDigest?: boolean;
      requireBuildInfo?: boolean;
    };

    const violations: PolicyViolation[] = [];

    // Check image digest
    if (params.requireImageDigest && !evidence.imageDigest) {
      violations.push({
        severity: VulnerabilitySeverity.HIGH,
        message: 'Image digest is required but not provided',
      });
    }

    // Check build information
    if (params.requireBuildInfo && !evidence.buildEntityId) {
      violations.push({
        severity: VulnerabilitySeverity.MEDIUM,
        message: 'Build information is required but not provided',
      });
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Evaluate allowed registries policy
   */
  private evaluateAllowedRegistries(
    policy: PolicyEntity,
    evidence: EvidenceEntity
  ): { passed: boolean; violations: PolicyViolation[] } {
    const params = policy.parameters as {
      allowedRegistries?: string[];
    };

    const violations: PolicyViolation[] = [];

    if (params.allowedRegistries && params.allowedRegistries.length > 0) {
      // Extract registry from image digest or metadata
      const imageRegistry = this.extractRegistry(evidence);

      if (imageRegistry) {
        const isAllowed = params.allowedRegistries.some((allowed) =>
          imageRegistry.includes(allowed)
        );

        if (!isAllowed) {
          violations.push({
            severity: VulnerabilitySeverity.HIGH,
            message: `Image registry "${imageRegistry}" is not in allowed list`,
            metadata: {
              imageRegistry,
              allowedRegistries: params.allowedRegistries,
            },
          });
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Extract registry from evidence metadata
   */
  private extractRegistry(evidence: EvidenceEntity): string | null {
    // Try to extract from metadata
    if (evidence.metadata && typeof evidence.metadata === 'object') {
      const metadata = evidence.metadata as {
        imageRegistry?: string;
        imageName?: string;
      };
      if (metadata.imageRegistry) {
        return metadata.imageRegistry;
      }
      if (metadata.imageName) {
        // Extract registry from full image name (e.g., "gcr.io/project/image:tag")
        const parts = metadata.imageName.split('/');
        if (parts.length > 1 && parts[0]) {
          return parts[0];
        }
      }
    }

    return null;
  }

  /**
   * Store policy evaluation result in database
   */
  private async storeEvaluationResult(
    evidenceId: string,
    result: PolicyEvaluationResult
  ): Promise<void> {
    await this.policyEvaluationRepo.save({
      evidenceId,
      policyId: result.policyId,
      passed: result.passed,
      violations: result.violations.map((v) => ({
        severity: v.severity,
        message: v.message,
        metadata: v.metadata,
      })),
      evaluatedAt: result.evaluatedAt,
    });

    logger.debug('Policy evaluation result stored', {
      evidenceId,
      policyId: result.policyId,
      passed: result.passed,
    });
  }

  /**
   * Get policy evaluation results for evidence
   */
  async getEvaluationResults(
    evidenceId: string
  ): Promise<PolicyEvaluationEntity[]> {
    return this.policyEvaluationRepo.find({
      where: { evidenceId },
      order: { evaluatedAt: 'DESC' },
    });
  }

  /**
   * Create a new policy
   */
  async createPolicy(policyData: Partial<PolicyEntity>): Promise<PolicyEntity> {
    const policy = this.policyRepo.create(policyData);
    return this.policyRepo.save(policy);
  }

  /**
   * Get all policies for a tenant
   */
  async getPolicies(tenantId: string): Promise<PolicyEntity[]> {
    return this.policyRepo.find({
      where: { tenantId },
      order: { priority: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Update a policy
   */
  async updatePolicy(
    policyId: string,
    updates: Partial<PolicyEntity>
  ): Promise<PolicyEntity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.policyRepo.update(policyId, updates as any);
    const updated = await this.policyRepo.findOne({ where: { id: policyId } });
    if (!updated) {
      throw new Error(`Policy not found: ${policyId}`);
    }
    return updated;
  }

  /**
   * Delete a policy
   */
  async deletePolicy(policyId: string): Promise<void> {
    await this.policyRepo.delete(policyId);
  }
}
