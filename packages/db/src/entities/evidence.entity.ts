import { EvidenceType, SBOMFormat } from '@aegis/shared';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { BuildEntity } from './build.entity';
import { TenantEntity } from './tenant.entity';
import { VulnerabilityEntity } from './vulnerability.entity';

@Entity('evidence')
@Index(['tenantId', 'projectName', 'buildId'])
@Index(['imageDigest'])
@Index(['createdAt'])
export class EvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.evidence, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 255 })
  projectName!: string;

  @Column({ type: 'varchar', length: 255 })
  buildId!: string;

  @Column({ type: 'uuid', nullable: true })
  buildEntityId?: string;

  @ManyToOne(() => BuildEntity, (build) => build.evidence, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'buildEntityId' })
  build?: BuildEntity;

  @Column({ type: 'varchar', length: 255 })
  imageDigest!: string;

  @Column({
    type: 'enum',
    enum: EvidenceType,
  })
  type!: EvidenceType;

  @Column({
    type: 'enum',
    enum: SBOMFormat,
    nullable: true,
  })
  format?: SBOMFormat;

  @Column({ type: 'varchar', length: 512 })
  s3Uri!: string;

  @Column({ type: 'varchar', length: 255 })
  s3Bucket!: string;

  @Column({ type: 'varchar', length: 512 })
  s3Key!: string;

  @Column({ type: 'bigint', nullable: true })
  fileSizeBytes?: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sha256Checksum?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @OneToMany(() => VulnerabilityEntity, (vuln) => vuln.evidence)
  vulnerabilities!: VulnerabilityEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
