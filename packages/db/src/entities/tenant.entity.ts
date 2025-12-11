import { TenantTier, TenantStatus } from '@aegis/shared';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { EvidenceEntity } from './evidence.entity';
import { ProjectEntity } from './project.entity';
import { UserEntity } from './user.entity';

@Entity('tenants')
@Index(['slug'], { unique: true })
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 63, unique: true })
  slug!: string;

  @Column({
    type: 'enum',
    enum: TenantTier,
    default: TenantTier.FREE,
  })
  tier!: TenantTier;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status!: TenantStatus;

  @Column({ type: 'jsonb', default: {} })
  settings!: {
    maxProjects?: number;
    maxUsers?: number;
    retentionDays?: number;
    enabledFeatures: string[];
  };

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @OneToMany(() => UserEntity, (user) => user.tenant)
  users!: UserEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.tenant)
  projects!: ProjectEntity[];

  @OneToMany(() => EvidenceEntity, (evidence) => evidence.tenant)
  evidence!: EvidenceEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
