/**
 * Incident Entity - Centralized monitoring and alerting
 * Represents clustered security incidents (vulnerabilities, policy violations, etc.)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TenantEntity } from './tenant.entity';

export enum IncidentStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IncidentSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum IncidentType {
  VULNERABILITY = 'VULNERABILITY',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  SYSTEM = 'SYSTEM',
}

@Entity('incidents')
@Index(['tenantId', 'status'])
@Index(['severity', 'createdAt'])
@Index(['clusterId'])
@Index(['impactedService'])
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type!: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
  })
  severity!: IncidentSeverity;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.ACTIVE,
  })
  status!: IncidentStatus;

  // Clustering information
  @Column({ type: 'varchar', length: 255, nullable: true })
  clusterId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clusterName?: string;

  // Affected resources
  @Column({ type: 'varchar', length: 255, nullable: true })
  impactedService?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectName?: string;

  @Column({ type: 'simple-array', nullable: true })
  affectedComponents?: string[];

  // Related evidence and vulnerabilities
  @Column({ type: 'simple-array', nullable: true })
  evidenceIds?: string[];

  @Column({ type: 'simple-array', nullable: true })
  vulnerabilityIds?: string[];

  @Column({ type: 'simple-array', nullable: true })
  policyEvaluationIds?: string[];

  // Metrics
  @Column({ type: 'integer', default: 0 })
  alertCount!: number;

  @Column({ type: 'integer', default: 0 })
  affectedAssets!: number;

  // Assignment and workflow
  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTo?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTeam?: string;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  // Additional metadata
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  tags!: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Time to acknowledge (SLA tracking)
  @Column({ type: 'integer', nullable: true })
  ttaMinutes?: number;

  // Time to resolve (SLA tracking)
  @Column({ type: 'integer', nullable: true })
  ttrMinutes?: number;
}
