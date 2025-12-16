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

import { EvidenceEntity } from './evidence.entity';

/**
 * Package Entity
 * Represents a software package extracted from an SBOM (Software Bill of Materials)
 * Supports both SPDX 2.3 and CycloneDX formats
 */
@Entity('packages')
@Index(['evidenceId'])
@Index(['name', 'version'])
@Index(['purl'])
@Index(['cpe'])
export class PackageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  evidenceId!: string;

  @ManyToOne(() => EvidenceEntity, (evidence) => evidence.packages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evidenceId' })
  evidence!: EvidenceEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 128 })
  version!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  downloadLocation?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  licenseConcluded?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  licenseDeclared?: string;

  @Column({ type: 'text', nullable: true })
  copyrightText?: string;

  /**
   * Package URL (purl) - standardized package identifier
   * Example: pkg:npm/express@4.18.2
   */
  @Column({ type: 'varchar', length: 512, nullable: true })
  purl?: string;

  /**
   * Common Platform Enumeration (CPE) identifier
   * Example: cpe:2.3:a:nodejs:node.js:18.0.0:*:*:*:*:*:*:*
   */
  @Column({ type: 'varchar', length: 512, nullable: true })
  cpe?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
