import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('artifacts')
@Index(['imageDigest'], { unique: true })
@Index(['registry', 'repository', 'tag'])
export class ArtifactEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  imageDigest!: string;

  @Column({ type: 'varchar', length: 255 })
  registry!: string;

  @Column({ type: 'varchar', length: 255 })
  repository!: string;

  @Column({ type: 'varchar', length: 128 })
  tag!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  signatureUri?: string;

  @Column({ type: 'jsonb', nullable: true })
  attestation?: Record<string, unknown>;

  @Column({ type: 'bigint', nullable: true })
  imageSizeBytes?: number;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
