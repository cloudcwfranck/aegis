import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add priority field to policies table
 * Supports Phase 2 of M2: Policy evaluation ordering
 */
export class AddPolicyPriority1734370000000 implements MigrationInterface {
  name = 'AddPolicyPriority1734370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add priority column
    await queryRunner.query(`
      ALTER TABLE "policies"
      ADD COLUMN "priority" integer NOT NULL DEFAULT 100
    `);

    // Create index for ordering policies by priority
    await queryRunner.query(`
      CREATE INDEX "idx_policies_priority" ON "policies" ("priority" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_policies_priority"`);

    // Drop priority column
    await queryRunner.query(`
      ALTER TABLE "policies"
      DROP COLUMN IF EXISTS "priority"
    `);
  }
}
