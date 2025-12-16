/**
 * POA&M Service - OSCAL 1.0.4 Compliant
 * Auto-generates POA&M items from vulnerabilities
 * Based on ADR-003: OSCAL-Native POA&M Generation
 */

import {
  AppDataSource,
  POAMItemEntity,
  POAMStatus,
  RiskLevel,
  Likelihood,
  Impact,
  VulnerabilityEntity,
} from '@aegis/db';
import { VulnerabilitySeverity } from '@aegis/shared';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logger';

interface CreatePOAMItemDto {
  tenantId: string;
  vulnerabilityId?: string;
  cveId?: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  likelihood: Likelihood;
  impact: Impact;
  cvssScore?: number;
  remediationPlan: string;
  affectedSystems?: string[];
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

interface POAMStats {
  total: number;
  byStatus: Record<POAMStatus, number>;
  byRiskLevel: Record<RiskLevel, number>;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
}

/**
 * POA&M Service
 * Implements NIST 800-30 risk assessment and POA&M generation
 */
export class POAMService {
  private poamRepo: Repository<POAMItemEntity>;
  private vulnerabilityRepo: Repository<VulnerabilityEntity>;

  constructor() {
    this.poamRepo = AppDataSource.getRepository(POAMItemEntity);
    this.vulnerabilityRepo = AppDataSource.getRepository(VulnerabilityEntity);
  }

  /**
   * Create a new POA&M item
   */
  async createPOAMItem(data: CreatePOAMItemDto): Promise<POAMItemEntity> {
    const dueDate = this.calculateDueDate(data.riskLevel);

    const poamItem = this.poamRepo.create({
      ...data,
      oscalUuid: uuidv4(),
      status: POAMStatus.OPEN,
      scheduledCompletionDate: dueDate,
      remediationSteps: this.generateRemediationSteps(data),
      affectedControls: this.mapToNISTControls(data.cveId),
      relatedObservations: data.vulnerabilityId
        ? [
            {
              observationUuid: data.vulnerabilityId,
              type: 'vulnerability-scan' as const,
              description: `Vulnerability scan detected ${data.cveId}`,
            },
          ]
        : [],
    });

    await this.poamRepo.save(poamItem);

    logger.info('POA&M item created', {
      poamId: poamItem.id,
      oscalUuid: poamItem.oscalUuid,
      cveId: poamItem.cveId,
      riskLevel: poamItem.riskLevel,
    });

    return poamItem;
  }

  /**
   * Auto-generate POA&M items from vulnerabilities
   * Implements ADR-003 automatic CVE → POA&M mapping
   */
  async generatePOAMFromVulnerabilities(
    tenantId: string,
    evidenceId: string
  ): Promise<POAMItemEntity[]> {
    const vulnerabilities = await this.vulnerabilityRepo.find({
      where: { evidenceId },
    });

    const poamItems: POAMItemEntity[] = [];

    // Only create POA&M for Critical and High severity vulnerabilities
    const criticalAndHighVulns = vulnerabilities.filter(
      (v) =>
        v.severity === VulnerabilitySeverity.CRITICAL ||
        v.severity === VulnerabilitySeverity.HIGH
    );

    for (const vuln of criticalAndHighVulns) {
      // Check if POA&M already exists for this CVE
      const existing = await this.poamRepo.findOne({
        where: { cveId: vuln.cveId, tenantId },
      });

      if (existing) {
        logger.info('POA&M already exists for CVE', { cveId: vuln.cveId });
        continue;
      }

      // Calculate risk using NIST 800-30 methodology
      const risk = this.calculateRisk(vuln.cvssScore ?? 0, vuln.severity);

      const poamItem = await this.createPOAMItem({
        tenantId,
        vulnerabilityId: vuln.id,
        cveId: vuln.cveId,
        title: `${vuln.cveId} in ${vuln.packageName}@${vuln.packageVersion}`,
        description: vuln.description,
        riskLevel: risk.riskLevel,
        likelihood: risk.likelihood,
        impact: risk.impact,
        cvssScore: vuln.cvssScore,
        remediationPlan: this.generateRemediationPlan(vuln),
        affectedSystems: [], // To be populated by caller
        metadata: {
          packageName: vuln.packageName,
          packageVersion: vuln.packageVersion,
          fixedVersion: vuln.fixedVersion,
          cvssVector: vuln.cvssVector,
        },
      });

      poamItems.push(poamItem);
    }

    logger.info('POA&M items generated from vulnerabilities', {
      tenantId,
      evidenceId,
      poamCount: poamItems.length,
    });

    return poamItems;
  }

  /**
   * Calculate risk level using NIST 800-30 methodology
   * Risk = Likelihood × Impact
   */
  private calculateRisk(
    cvssScore: number,
    severity: VulnerabilitySeverity
  ): {
    riskLevel: RiskLevel;
    likelihood: Likelihood;
    impact: Impact;
  } {
    // CVSS Score → Likelihood mapping
    let likelihood: Likelihood;
    if (cvssScore >= 9.0) {
      likelihood = Likelihood.HIGH;
    } else if (cvssScore >= 7.0) {
      likelihood = Likelihood.MEDIUM;
    } else {
      likelihood = Likelihood.LOW;
    }

    // Severity → Impact mapping
    let impact: Impact;
    if (
      severity === VulnerabilitySeverity.CRITICAL ||
      severity === VulnerabilitySeverity.HIGH
    ) {
      impact = Impact.HIGH;
    } else if (severity === VulnerabilitySeverity.MEDIUM) {
      impact = Impact.MEDIUM;
    } else {
      impact = Impact.LOW;
    }

    // Risk matrix (NIST 800-30)
    const riskMatrix: Record<string, RiskLevel> = {
      'high-high': RiskLevel.VERY_HIGH,
      'high-medium': RiskLevel.HIGH,
      'high-low': RiskLevel.MODERATE,
      'medium-high': RiskLevel.HIGH,
      'medium-medium': RiskLevel.MODERATE,
      'medium-low': RiskLevel.LOW,
      'low-high': RiskLevel.MODERATE,
      'low-medium': RiskLevel.LOW,
      'low-low': RiskLevel.LOW,
    };

    const riskKey = `${likelihood}-${impact}`;
    const riskLevel = riskMatrix[riskKey] || RiskLevel.MODERATE;

    return { riskLevel, likelihood, impact };
  }

  /**
   * Calculate due date based on risk level
   * Per NIST 800-40 Rev 4 patch management guidance
   */
  private calculateDueDate(riskLevel: RiskLevel): Date {
    const now = new Date();
    const dueDateDays: Record<RiskLevel, number> = {
      [RiskLevel.VERY_HIGH]: 30, // 30 days
      [RiskLevel.HIGH]: 90, // 90 days
      [RiskLevel.MODERATE]: 180, // 180 days
      [RiskLevel.LOW]: 365, // 365 days
    };

    const days = dueDateDays[riskLevel];
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + days);

    return dueDate;
  }

  /**
   * Generate remediation plan for vulnerability
   */
  private generateRemediationPlan(vuln: VulnerabilityEntity): string {
    if (vuln.fixedVersion) {
      return `Upgrade ${vuln.packageName} from version ${vuln.packageVersion} to ${vuln.fixedVersion} to remediate ${vuln.cveId}.`;
    }

    return `Review and apply security patches for ${vuln.packageName} to address ${vuln.cveId}. Monitor vendor advisories for fix availability.`;
  }

  /**
   * Generate detailed remediation steps
   */
  private generateRemediationSteps(
    data: CreatePOAMItemDto
  ): Array<{ uuid: string; title: string; description: string }> {
    const steps = [];

    if (data.metadata?.['fixedVersion']) {
      steps.push({
        uuid: uuidv4(),
        title: `Update ${data.metadata['packageName']} to ${data.metadata['fixedVersion']}`,
        description: `Upgrade package in dependency manifest and rebuild container image.`,
      });
    }

    steps.push({
      uuid: uuidv4(),
      title: 'Test changes in non-production environment',
      description: 'Verify application functionality after dependency upgrade.',
    });

    steps.push({
      uuid: uuidv4(),
      title: 'Deploy to production with approval',
      description: 'Follow change management process for production deployment.',
    });

    steps.push({
      uuid: uuidv4(),
      title: 'Verify remediation',
      description:
        'Run vulnerability scan to confirm CVE is no longer present.',
    });

    return steps;
  }

  /**
   * Map CVE to NIST 800-53 Rev 5 controls
   */
  private mapToNISTControls(
    _cveId?: string
  ): Array<{ catalogName: string; controlId: string; controlName: string }> {
    // Default controls for vulnerability management
    return [
      {
        catalogName: 'NIST 800-53 Rev 5',
        controlId: 'RA-5',
        controlName: 'Vulnerability Monitoring and Scanning',
      },
      {
        catalogName: 'NIST 800-53 Rev 5',
        controlId: 'SI-2',
        controlName: 'Flaw Remediation',
      },
      {
        catalogName: 'NIST 800-53 Rev 5',
        controlId: 'CM-2',
        controlName: 'Baseline Configuration',
      },
    ];
  }

  /**
   * Update POA&M status
   */
  async updatePOAMStatus(
    poamId: string,
    status: POAMStatus,
    userId?: string,
    rationale?: string
  ): Promise<POAMItemEntity> {
    const poamItem = await this.poamRepo.findOne({ where: { id: poamId } });

    if (!poamItem) {
      throw new Error(`POA&M item not found: ${poamId}`);
    }

    poamItem.status = status;
    poamItem.updatedAt = new Date();

    // Handle closure
    if (status === POAMStatus.CLOSED) {
      poamItem.closedDate = new Date();
      poamItem.closedBy = userId;
      poamItem.closureRationale = rationale;
      poamItem.actualCompletionDate = new Date();
    }

    // Handle risk acceptance
    if (status === POAMStatus.RISK_ACCEPTED) {
      poamItem.approvedDate = new Date();
      poamItem.approvedBy = userId;
      poamItem.deviationRationale = rationale;
    }

    await this.poamRepo.save(poamItem);

    logger.info('POA&M status updated', {
      poamId,
      status,
      userId,
    });

    return poamItem;
  }

  /**
   * Automatically close POA&M items when CVE is remediated
   */
  async autoClosePOAMIfVulnRemediated(
    cveId: string,
    tenantId: string
  ): Promise<void> {
    // Check if vulnerability still exists in latest scans
    const vulnStillExists = await this.vulnerabilityRepo.findOne({
      where: { cveId },
    });

    if (!vulnStillExists) {
      // CVE has been remediated - close POA&M
      const poamItems = await this.poamRepo.find({
        where: { cveId, tenantId, status: POAMStatus.OPEN },
      });

      for (const poamItem of poamItems) {
        await this.updatePOAMStatus(
          poamItem.id,
          POAMStatus.CLOSED,
          'system',
          'CVE no longer detected in latest vulnerability scans'
        );
      }

      logger.info('POA&M items auto-closed for remediated CVE', {
        cveId,
        count: poamItems.length,
      });
    }
  }

  /**
   * Get POA&M items with filters
   */
  async getPOAMItems(
    tenantId: string,
    filters?: {
      status?: POAMStatus[];
      riskLevel?: RiskLevel[];
      assignedTo?: string;
      overdue?: boolean;
      limit?: number;
    }
  ): Promise<POAMItemEntity[]> {
    const query = this.poamRepo.createQueryBuilder('poam');
    query.where('poam.tenantId = :tenantId', { tenantId });

    if (filters?.status && filters.status.length > 0) {
      query.andWhere('poam.status IN (:...statuses)', {
        statuses: filters.status,
      });
    }

    if (filters?.riskLevel && filters.riskLevel.length > 0) {
      query.andWhere('poam.riskLevel IN (:...riskLevels)', {
        riskLevels: filters.riskLevel,
      });
    }

    if (filters?.assignedTo) {
      query.andWhere('poam.assignedTo = :assignedTo', {
        assignedTo: filters.assignedTo,
      });
    }

    if (filters?.overdue) {
      query.andWhere('poam.scheduledCompletionDate < :now', { now: new Date() });
      query.andWhere('poam.status != :closed', { closed: POAMStatus.CLOSED });
    }

    query.orderBy('poam.riskLevel', 'ASC');
    query.addOrderBy('poam.scheduledCompletionDate', 'ASC');

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }

  /**
   * Get POA&M statistics
   */
  async getPOAMStats(tenantId: string): Promise<POAMStats> {
    const poamItems = await this.poamRepo.find({ where: { tenantId } });

    const stats: POAMStats = {
      total: poamItems.length,
      byStatus: {
        [POAMStatus.OPEN]: 0,
        [POAMStatus.RISK_ACCEPTED]: 0,
        [POAMStatus.INVESTIGATING]: 0,
        [POAMStatus.REMEDIATION_PLANNED]: 0,
        [POAMStatus.REMEDIATION_IN_PROGRESS]: 0,
        [POAMStatus.DEVIATION_REQUESTED]: 0,
        [POAMStatus.CLOSED]: 0,
      },
      byRiskLevel: {
        [RiskLevel.VERY_HIGH]: 0,
        [RiskLevel.HIGH]: 0,
        [RiskLevel.MODERATE]: 0,
        [RiskLevel.LOW]: 0,
      },
      overdue: 0,
      dueThisWeek: 0,
      dueThisMonth: 0,
    };

    const now = new Date();
    const oneWeek = new Date(now);
    oneWeek.setDate(oneWeek.getDate() + 7);
    const oneMonth = new Date(now);
    oneMonth.setMonth(oneMonth.getMonth() + 1);

    for (const poam of poamItems) {
      stats.byStatus[poam.status]++;
      stats.byRiskLevel[poam.riskLevel]++;

      if (
        poam.status !== POAMStatus.CLOSED &&
        poam.scheduledCompletionDate < now
      ) {
        stats.overdue++;
      }

      if (
        poam.status !== POAMStatus.CLOSED &&
        poam.scheduledCompletionDate >= now &&
        poam.scheduledCompletionDate <= oneWeek
      ) {
        stats.dueThisWeek++;
      }

      if (
        poam.status !== POAMStatus.CLOSED &&
        poam.scheduledCompletionDate >= now &&
        poam.scheduledCompletionDate <= oneMonth
      ) {
        stats.dueThisMonth++;
      }
    }

    return stats;
  }
}
