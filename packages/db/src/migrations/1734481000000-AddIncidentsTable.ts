import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidentsTable1734481000000 implements MigrationInterface {
  name = 'AddIncidentsTable1734481000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "incident_status_enum" AS ENUM (
        'ACTIVE',
        'ACKNOWLEDGED',
        'INVESTIGATING',
        'RESOLVED',
        'CLOSED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "incident_severity_enum" AS ENUM (
        'CRITICAL',
        'HIGH',
        'MEDIUM',
        'LOW',
        'INFO'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "incident_type_enum" AS ENUM (
        'VULNERABILITY',
        'POLICY_VIOLATION',
        'COMPLIANCE',
        'SECURITY_ALERT',
        'SYSTEM'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "incidents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "type" incident_type_enum NOT NULL,
        "severity" incident_severity_enum NOT NULL,
        "status" incident_status_enum NOT NULL DEFAULT 'ACTIVE',
        "clusterId" varchar(255),
        "clusterName" varchar(255),
        "impactedService" varchar(255),
        "projectName" varchar(255),
        "affectedComponents" text,
        "evidenceIds" text,
        "vulnerabilityIds" text,
        "policyEvaluationIds" text,
        "alertCount" integer NOT NULL DEFAULT 0,
        "affectedAssets" integer NOT NULL DEFAULT 0,
        "assignedTo" varchar(255),
        "assignedTeam" varchar(255),
        "acknowledgedAt" timestamptz,
        "resolvedAt" timestamptz,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "tags" jsonb NOT NULL DEFAULT '[]',
        "ttaMinutes" integer,
        "ttrMinutes" integer,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_incidents_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_incidents_tenant_status" ON "incidents" ("tenantId", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_incidents_severity_created" ON "incidents" ("severity", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_incidents_cluster" ON "incidents" ("clusterId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_incidents_service" ON "incidents" ("impactedService")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_incidents_service"`);
    await queryRunner.query(`DROP INDEX "idx_incidents_cluster"`);
    await queryRunner.query(`DROP INDEX "idx_incidents_severity_created"`);
    await queryRunner.query(`DROP INDEX "idx_incidents_tenant_status"`);
    await queryRunner.query(`DROP TABLE "incidents"`);
    await queryRunner.query(`DROP TYPE "incident_type_enum"`);
    await queryRunner.query(`DROP TYPE "incident_severity_enum"`);
    await queryRunner.query(`DROP TYPE "incident_status_enum"`);
  }
}
