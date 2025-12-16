/**
 * Incident Service - Centralized monitoring and incident management
 * Handles incident creation, clustering, and workflow management
 */

import {
  AppDataSource,
  IncidentEntity,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  VulnerabilityEntity,
  PolicyEvaluationEntity,
  EvidenceEntity,
} from '@aegis/db';
import { Repository, Between, In } from 'typeorm';

import { logger } from '../utils/logger';

interface CreateIncidentDto {
  tenantId: string;
  title: string;
  description?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  impactedService?: string;
  projectName?: string;
  evidenceIds?: string[];
  vulnerabilityIds?: string[];
  policyEvaluationIds?: string[];
  metadata?: Record<string, unknown>;
}

interface IncidentCluster {
  clusterId: string;
  clusterName: string;
  severity: IncidentSeverity;
  incidentCount: number;
  totalAlerts: number;
  affectedServices: string[];
  incidents: IncidentEntity[];
}

interface IncidentStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byType: Record<string, number>;
  avgTTA: number; // Average Time to Acknowledge
  avgTTR: number; // Average Time to Resolve
}

export class IncidentService {
  private incidentRepo: Repository<IncidentEntity>;
  private vulnerabilityRepo: Repository<VulnerabilityEntity>;
  private policyEvaluationRepo: Repository<PolicyEvaluationEntity>;
  private evidenceRepo: Repository<EvidenceEntity>;

  constructor() {
    this.incidentRepo = AppDataSource.getRepository(IncidentEntity);
    this.vulnerabilityRepo = AppDataSource.getRepository(VulnerabilityEntity);
    this.policyEvaluationRepo = AppDataSource.getRepository(
      PolicyEvaluationEntity
    );
    this.evidenceRepo = AppDataSource.getRepository(EvidenceEntity);
  }

  /**
   * Create a new incident
   */
  async createIncident(data: CreateIncidentDto): Promise<IncidentEntity> {
    const incident = this.incidentRepo.create({
      ...data,
      status: IncidentStatus.ACTIVE,
      alertCount: 1,
      affectedAssets: 1,
      createdAt: new Date(),
    });

    await this.incidentRepo.save(incident);

    logger.info('Incident created', {
      incidentId: incident.id,
      severity: incident.severity,
      type: incident.type,
    });

    return incident;
  }

  /**
   * Auto-generate incidents from vulnerabilities
   */
  async generateIncidentsFromVulnerabilities(
    tenantId: string,
    evidenceId: string
  ): Promise<IncidentEntity[]> {
    const vulnerabilities = await this.vulnerabilityRepo.find({
      where: { evidenceId },
    });

    const evidence = await this.evidenceRepo.findOne({
      where: { id: evidenceId },
    });

    if (!evidence) {
      throw new Error(`Evidence not found: ${evidenceId}`);
    }

    // Group vulnerabilities by severity
    const criticalVulns = vulnerabilities.filter((v) => v.severity === 'Critical');
    const highVulns = vulnerabilities.filter((v) => v.severity === 'High');

    const incidents: IncidentEntity[] = [];

    // Create incident for critical vulnerabilities
    if (criticalVulns.length > 0) {
      const incident = await this.createIncident({
        tenantId,
        title: `${criticalVulns.length} Critical Vulnerabilities in ${evidence.projectName}`,
        description: `Critical vulnerabilities detected: ${criticalVulns
          .map((v) => v.cveId)
          .join(', ')}`,
        type: IncidentType.VULNERABILITY,
        severity: IncidentSeverity.CRITICAL,
        projectName: evidence.projectName,
        impactedService: evidence.projectName,
        evidenceIds: [evidenceId],
        vulnerabilityIds: criticalVulns.map((v) => v.id),
        metadata: {
          vulnerabilityCount: criticalVulns.length,
          imageDigest: evidence.imageDigest,
        },
      });

      incidents.push(incident);
    }

    // Create incident for high vulnerabilities
    if (highVulns.length > 0) {
      const incident = await this.createIncident({
        tenantId,
        title: `${highVulns.length} High Vulnerabilities in ${evidence.projectName}`,
        description: `High vulnerabilities detected: ${highVulns
          .slice(0, 5)
          .map((v) => v.cveId)
          .join(', ')}${highVulns.length > 5 ? '...' : ''}`,
        type: IncidentType.VULNERABILITY,
        severity: IncidentSeverity.HIGH,
        projectName: evidence.projectName,
        impactedService: evidence.projectName,
        evidenceIds: [evidenceId],
        vulnerabilityIds: highVulns.map((v) => v.id),
        metadata: {
          vulnerabilityCount: highVulns.length,
          imageDigest: evidence.imageDigest,
        },
      });

      incidents.push(incident);
    }

    return incidents;
  }

  /**
   * Auto-generate incidents from policy violations
   */
  async generateIncidentsFromPolicyViolations(
    tenantId: string,
    evidenceId: string
  ): Promise<IncidentEntity[]> {
    const policyEvaluations = await this.policyEvaluationRepo.find({
      where: { evidenceId, passed: false },
    });

    const evidence = await this.evidenceRepo.findOne({
      where: { id: evidenceId },
    });

    if (!evidence || policyEvaluations.length === 0) {
      return [];
    }

    const incident = await this.createIncident({
      tenantId,
      title: `${policyEvaluations.length} Policy Violations in ${evidence.projectName}`,
      description: `Policy violations detected for ${evidence.projectName}`,
      type: IncidentType.POLICY_VIOLATION,
      severity: IncidentSeverity.HIGH,
      projectName: evidence.projectName,
      impactedService: evidence.projectName,
      evidenceIds: [evidenceId],
      policyEvaluationIds: policyEvaluations.map((p) => p.id),
      metadata: {
        violationCount: policyEvaluations.length,
        policies: policyEvaluations.map((p) => p.policyId),
      },
    });

    return [incident];
  }

  /**
   * Cluster incidents by similarity
   */
  async clusterIncidents(tenantId: string): Promise<IncidentCluster[]> {
    const incidents = await this.incidentRepo.find({
      where: {
        tenantId,
        status: In([IncidentStatus.ACTIVE, IncidentStatus.ACKNOWLEDGED]),
      },
      order: { createdAt: 'DESC' },
    });

    // Group by project + type + severity
    const clusters = new Map<string, IncidentEntity[]>();

    for (const incident of incidents) {
      const key = `${incident.projectName || 'unknown'}-${incident.type}-${incident.severity}`;

      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(incident);
    }

    // Convert to cluster format
    const result: IncidentCluster[] = [];
    let clusterIndex = 0;

    for (const [key, incidentList] of clusters.entries()) {
      if (incidentList.length > 0) {
        const firstIncident = incidentList[0];
        const affectedServices = [
          ...new Set(incidentList.map((i) => i.impactedService).filter(Boolean)),
        ] as string[];

        result.push({
          clusterId: `cluster-${clusterIndex++}`,
          clusterName: `${firstIncident.projectName} - ${firstIncident.type}`,
          severity: firstIncident.severity,
          incidentCount: incidentList.length,
          totalAlerts: incidentList.reduce((sum, i) => sum + i.alertCount, 0),
          affectedServices,
          incidents: incidentList,
        });
      }
    }

    return result.sort((a, b) => {
      // Sort by severity and count
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
      const aDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (aDiff !== 0) return aDiff;
      return b.incidentCount - a.incidentCount;
    });
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(tenantId: string): Promise<IncidentStats> {
    const incidents = await this.incidentRepo.find({ where: { tenantId } });

    const stats: IncidentStats = {
      total: incidents.length,
      active: incidents.filter((i) => i.status === IncidentStatus.ACTIVE).length,
      acknowledged: incidents.filter((i) => i.status === IncidentStatus.ACKNOWLEDGED)
        .length,
      resolved: incidents.filter((i) => i.status === IncidentStatus.RESOLVED).length,
      bySeverity: {
        critical: incidents.filter((i) => i.severity === IncidentSeverity.CRITICAL)
          .length,
        high: incidents.filter((i) => i.severity === IncidentSeverity.HIGH).length,
        medium: incidents.filter((i) => i.severity === IncidentSeverity.MEDIUM).length,
        low: incidents.filter((i) => i.severity === IncidentSeverity.LOW).length,
        info: incidents.filter((i) => i.severity === IncidentSeverity.INFO).length,
      },
      byType: {},
      avgTTA: 0,
      avgTTR: 0,
    };

    // Calculate averages
    const withTTA = incidents.filter((i) => i.ttaMinutes);
    const withTTR = incidents.filter((i) => i.ttrMinutes);

    if (withTTA.length > 0) {
      stats.avgTTA = withTTA.reduce((sum, i) => sum + (i.ttaMinutes || 0), 0) / withTTA.length;
    }

    if (withTTR.length > 0) {
      stats.avgTTR = withTTR.reduce((sum, i) => sum + (i.ttrMinutes || 0), 0) / withTTR.length;
    }

    // Count by type
    for (const incident of incidents) {
      const type = incident.type.toString();
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    userId?: string
  ): Promise<IncidentEntity> {
    const incident = await this.incidentRepo.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const now = new Date();
    incident.status = status;
    incident.updatedAt = now;

    // Calculate SLA metrics
    if (status === IncidentStatus.ACKNOWLEDGED && !incident.acknowledgedAt) {
      incident.acknowledgedAt = now;
      incident.ttaMinutes = Math.floor(
        (now.getTime() - incident.createdAt.getTime()) / 60000
      );
    }

    if (status === IncidentStatus.RESOLVED && !incident.resolvedAt) {
      incident.resolvedAt = now;
      incident.ttrMinutes = Math.floor(
        (now.getTime() - incident.createdAt.getTime()) / 60000
      );
    }

    if (userId) {
      incident.assignedTo = userId;
    }

    await this.incidentRepo.save(incident);

    logger.info('Incident status updated', {
      incidentId,
      status,
      ttaMinutes: incident.ttaMinutes,
      ttrMinutes: incident.ttrMinutes,
    });

    return incident;
  }

  /**
   * Get incidents with filters
   */
  async getIncidents(
    tenantId: string,
    filters?: {
      status?: IncidentStatus[];
      severity?: IncidentSeverity[];
      type?: IncidentType[];
      projectName?: string;
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
    }
  ): Promise<IncidentEntity[]> {
    const query = this.incidentRepo.createQueryBuilder('incident');
    query.where('incident.tenantId = :tenantId', { tenantId });

    if (filters?.status && filters.status.length > 0) {
      query.andWhere('incident.status IN (:...statuses)', { statuses: filters.status });
    }

    if (filters?.severity && filters.severity.length > 0) {
      query.andWhere('incident.severity IN (:...severities)', {
        severities: filters.severity,
      });
    }

    if (filters?.type && filters.type.length > 0) {
      query.andWhere('incident.type IN (:...types)', { types: filters.type });
    }

    if (filters?.projectName) {
      query.andWhere('incident.projectName = :projectName', {
        projectName: filters.projectName,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('incident.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    }

    query.orderBy('incident.createdAt', 'DESC');

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }
}
