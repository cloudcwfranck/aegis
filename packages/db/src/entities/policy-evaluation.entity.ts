import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('policy_evaluations')
@Index(['policyId', 'evaluatedAt'])
@Index(['evidenceId'])
export class PolicyEvaluationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  policyId!: string;

  @Column({ type: 'uuid', nullable: true })
  evidenceId?: string;

  @Column({ type: 'boolean' })
  passed!: boolean;

  @Column({ type: 'jsonb', default: [] })
  violations!: Array<{
    message: string;
    severity: string;
    metadata?: Record<string, unknown>;
  }>;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  evaluatedAt!: Date;
}
