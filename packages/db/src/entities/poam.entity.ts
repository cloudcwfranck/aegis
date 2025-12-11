import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { VulnerabilitySeverity, POAMStatus } from '@aegis/shared';

@Entity('poam_items')
@Index(['tenantId', 'status'])
@Index(['vulnerabilityId'])
@Index(['dueDate'])
@Index(['assignedTo'])
export class POAMEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  vulnerabilityId!: string;

  @Column({ type: 'varchar', length: 512 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: VulnerabilitySeverity,
  })
  riskLevel!: VulnerabilitySeverity;

  @Column({
    type: 'enum',
    enum: POAMStatus,
    default: POAMStatus.OPEN,
  })
  status!: POAMStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @Column({ type: 'text' })
  remediationSteps!: string;

  @Column({ type: 'jsonb', default: [] })
  affectedSystems!: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
