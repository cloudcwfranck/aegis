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

import { ProjectEntity } from './project.entity';
import { EvidenceEntity } from './evidence.entity';

@Entity('builds')
@Index(['projectId', 'buildNumber'])
@Index(['gitCommitSha'])
@Index(['createdAt'])
export class BuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.builds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: ProjectEntity;

  @Column({ type: 'varchar', length: 255 })
  buildNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gitCommitSha?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gitBranch?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  ciPipelineUrl?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  status?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @OneToMany(() => EvidenceEntity, (evidence) => evidence.build)
  evidence!: EvidenceEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
