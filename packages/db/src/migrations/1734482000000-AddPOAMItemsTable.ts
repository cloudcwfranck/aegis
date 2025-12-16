import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPOAMItemsTable1734482000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create POA&M Status enum
    await queryRunner.query(`
      CREATE TYPE "poam_status_enum" AS ENUM (
        'open',
        'risk-accepted',
        'investigating',
        'remediation-planned',
        'remediation-in-progress',
        'deviation-requested',
        'closed'
      )
    `);

    // Create Risk Level enum (NIST 800-30)
    await queryRunner.query(`
      CREATE TYPE "risk_level_enum" AS ENUM (
        'very-high',
        'high',
        'moderate',
        'low'
      )
    `);

    // Create Likelihood enum
    await queryRunner.query(`
      CREATE TYPE "likelihood_enum" AS ENUM (
        'high',
        'medium',
        'low'
      )
    `);

    // Create Impact enum
    await queryRunner.query(`
      CREATE TYPE "impact_enum" AS ENUM (
        'high',
        'medium',
        'low'
      )
    `);

    // Create poam_items table
    await queryRunner.query(`
      CREATE TABLE "poam_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "oscalUuid" uuid UNIQUE NOT NULL,
        "vulnerabilityId" uuid,
        "cveId" varchar(50),
        "title" varchar(500) NOT NULL,
        "description" text NOT NULL,
        "status" poam_status_enum NOT NULL DEFAULT 'open',
        "riskLevel" risk_level_enum NOT NULL,
        "likelihood" likelihood_enum NOT NULL,
        "impact" impact_enum NOT NULL,
        "cvssScore" decimal(3,1),
        "remediationPlan" text NOT NULL,
        "remediationSteps" jsonb DEFAULT '[]'::jsonb,
        "scheduledCompletionDate" timestamp with time zone NOT NULL,
        "actualCompletionDate" timestamp with time zone,
        "assignedTo" varchar(255),
        "assignedTeam" varchar(255),
        "affectedControls" jsonb DEFAULT '[]'::jsonb,
        "relatedObservations" jsonb DEFAULT '[]'::jsonb,
        "affectedSystems" jsonb DEFAULT '[]'::jsonb,
        "isDeviation" boolean DEFAULT false,
        "deviationRationale" text,
        "approvedBy" varchar(255),
        "approvedDate" timestamp with time zone,
        "closureRationale" text,
        "closedBy" varchar(255),
        "closedDate" timestamp with time zone,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "oscalData" jsonb,
        "createdAt" timestamp with time zone DEFAULT now(),
        "updatedAt" timestamp with time zone DEFAULT now(),
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
        FOREIGN KEY ("vulnerabilityId") REFERENCES "vulnerabilities"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for efficient querying
    await queryRunner.query(`
      CREATE INDEX "idx_poam_items_tenant_status"
      ON "poam_items" ("tenantId", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_poam_items_tenant_risk_level"
      ON "poam_items" ("tenantId", "riskLevel")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_poam_items_tenant_scheduled_completion"
      ON "poam_items" ("tenantId", "scheduledCompletionDate")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_poam_items_cve_id"
      ON "poam_items" ("cveId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_poam_items_vulnerability_id"
      ON "poam_items" ("vulnerabilityId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_poam_items_vulnerability_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_poam_items_cve_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_poam_items_tenant_scheduled_completion"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_poam_items_tenant_risk_level"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_poam_items_tenant_status"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "poam_items"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "impact_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "likelihood_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "poam_status_enum"`);
  }
}
