import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PolicyType, PolicyEnforcementLevel } from '@aegis/shared';

@Entity('policies')
@Index(['tenantId', 'name'], { unique: true })
@Index(['type'])
@Index(['enabled'])
export class PolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: PolicyType,
  })
  type!: PolicyType;

  @Column({
    type: 'enum',
    enum: PolicyEnforcementLevel,
    default: PolicyEnforcementLevel.WARNING,
  })
  enforcementLevel!: PolicyEnforcementLevel;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'text' })
  regoCode!: string;

  @Column({ type: 'jsonb', default: {} })
  parameters!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
