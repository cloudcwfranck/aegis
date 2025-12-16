/**
 * POA&M Entity - OSCAL 1.0.4 Compliant
 * Plan of Action and Milestones for vulnerability remediation tracking
 * Based on ADR-003: OSCAL-Native POA&M Generation
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { TenantEntity } from './tenant.entity';
import { VulnerabilityEntity } from './vulnerability.entity';

/**
 * POA&M Status (OSCAL risk.status)
 */
export enum POAMStatus {
  OPEN = 'open',
  RISK_ACCEPTED = 'risk-accepted',
  INVESTIGATING = 'investigating',
  REMEDIATION_PLANNED = 'remediation-planned',
  REMEDIATION_IN_PROGRESS = 'remediation-in-progress',
  DEVIATION_REQUESTED = 'deviation-requested',
  CLOSED = 'closed',
}

/**
 * Risk Level (NIST 800-30 based)
 */
export enum RiskLevel {
  VERY_HIGH = 'very-high',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
}

/**
 * Likelihood level (NIST 800-30)
 */
export enum Likelihood {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Impact level (NIST 800-30)
 */
export enum Impact {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * POA&M Item Entity
 * Based on OSCAL 1.0.4 plan-of-action-and-milestones.poam-items
 */
@Entity('poam_items')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'riskLevel'])
@Index(['tenantId', 'scheduledCompletionDate'])
@Index(['cveId'])
@Index(['vulnerabilityId'])
export class POAMItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenantId' })
  tenant!: TenantEntity;

  // OSCAL uuid field
  @Column({ type: 'uuid', unique: true })
  oscalUuid!: string;

  // Linked vulnerability (if POA&M is for a CVE)
  @Column({ type: 'uuid', nullable: true })
  vulnerabilityId?: string;

  @ManyToOne(() => VulnerabilityEntity, { nullable: true })
  @JoinColumn({ name: 'vulnerabilityId' })
  vulnerability?: VulnerabilityEntity;

  // CVE ID for quick reference
  @Column({ type: 'varchar', length: 50, nullable: true })
  cveId?: string;

  // OSCAL title
  @Column({ type: 'varchar', length: 500 })
  title!: string;

  // OSCAL description
  @Column({ type: 'text' })
  description!: string;

  // Risk assessment (NIST 800-30)
  @Column({ type: 'enum', enum: POAMStatus, default: POAMStatus.OPEN })
  status!: POAMStatus;

  @Column({ type: 'enum', enum: RiskLevel })
  riskLevel!: RiskLevel;

  @Column({ type: 'enum', enum: Likelihood })
  likelihood!: Likelihood;

  @Column({ type: 'enum', enum: Impact })
  impact!: Impact;

  // CVSS score from vulnerability
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  cvssScore?: number;

  // Remediation tracking
  @Column({ type: 'text' })
  remediationPlan!: string;

  @Column({ type: 'jsonb', default: [] })
  remediationSteps!: {
    uuid: string;
    title: string;
    description: string;
    completedDate?: string;
  }[];

  @Column({ type: 'timestamp with time zone' })
  scheduledCompletionDate!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  actualCompletionDate?: Date;

  // Ownership and assignment
  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTo?: string; // User ID or email

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTeam?: string;

  // NIST 800-53 Control mapping
  @Column({ type: 'jsonb', default: [] })
  affectedControls!: {
    catalogName: string; // e.g., "NIST 800-53 Rev 5"
    controlId: string; // e.g., "RA-5", "SI-2"
    controlName: string; // e.g., "Vulnerability Monitoring and Scanning"
  }[];

  // Evidence references (OSCAL related-observations)
  @Column({ type: 'jsonb', default: [] })
  relatedObservations!: {
    observationUuid: string;
    type: 'vulnerability-scan' | 'policy-violation' | 'audit-finding';
    description?: string;
  }[];

  // Affected systems/components
  @Column({ type: 'jsonb', default: [] })
  affectedSystems!: string[];

  // Deviation/risk acceptance
  @Column({ type: 'boolean', default: false })
  isDeviation!: boolean;

  @Column({ type: 'text', nullable: true })
  deviationRationale?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedDate?: Date;

  // Closure information
  @Column({ type: 'text', nullable: true })
  closureRationale?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  closedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  closedDate?: Date;

  // Additional metadata
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  // Full OSCAL POA&M item (stored for export)
  @Column({ type: 'jsonb', nullable: true })
  oscalData?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
