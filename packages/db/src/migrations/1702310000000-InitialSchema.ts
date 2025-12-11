import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1702310000000 implements MigrationInterface {
  name = 'InitialSchema1702310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "slug" varchar(63) NOT NULL UNIQUE,
        "tier" varchar(50) NOT NULL DEFAULT 'FREE',
        "status" varchar(50) NOT NULL DEFAULT 'TRIAL',
        "settings" jsonb NOT NULL DEFAULT '{}',
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_tenants_slug" ON "tenants" ("slug")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_tenants_status" ON "tenants" ("status")`
    );

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "role" varchar(50) NOT NULL DEFAULT 'DEVELOPER',
        "status" varchar(50) NOT NULL DEFAULT 'PENDING',
        "tenantId" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "keycloakId" varchar(255),
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "lastLoginAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "unique_tenant_email" UNIQUE ("tenantId", "email")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users" ("email")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_tenant" ON "users" ("tenantId")`
    );

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "description" text,
        "repositoryUrl" varchar(512),
        "settings" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "unique_tenant_project" UNIQUE ("tenantId", "name")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_projects_tenant" ON "projects" ("tenantId")`
    );

    // Create builds table
    await queryRunner.query(`
      CREATE TABLE "builds" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "buildNumber" varchar(255) NOT NULL,
        "gitCommitSha" varchar(255),
        "gitBranch" varchar(255),
        "ciPipelineUrl" varchar(512),
        "status" varchar(128),
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_builds_project" ON "builds" ("projectId", "buildNumber")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_builds_commit" ON "builds" ("gitCommitSha")`
    );

    // Create evidence table
    await queryRunner.query(`
      CREATE TABLE "evidence" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "projectName" varchar(255) NOT NULL,
        "buildId" varchar(255) NOT NULL,
        "buildEntityId" uuid REFERENCES "builds"("id") ON DELETE CASCADE,
        "imageDigest" varchar(255) NOT NULL,
        "type" varchar(50) NOT NULL,
        "format" varchar(50),
        "s3Uri" varchar(512) NOT NULL,
        "s3Bucket" varchar(255) NOT NULL,
        "s3Key" varchar(512) NOT NULL,
        "fileSizeBytes" bigint,
        "sha256Checksum" varchar(64),
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_evidence_tenant_project" ON "evidence" ("tenantId", "projectName")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_evidence_image" ON "evidence" ("imageDigest")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_evidence_created" ON "evidence" ("createdAt")`
    );

    // Create artifacts table
    await queryRunner.query(`
      CREATE TABLE "artifacts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "imageDigest" varchar(255) NOT NULL UNIQUE,
        "registry" varchar(255) NOT NULL,
        "repository" varchar(255) NOT NULL,
        "tag" varchar(128) NOT NULL,
        "signatureUri" varchar(512),
        "attestation" jsonb,
        "imageSizeBytes" bigint,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_artifacts_digest" ON "artifacts" ("imageDigest")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_artifacts_registry" ON "artifacts" ("registry", "repository", "tag")`
    );

    // Create vulnerabilities table
    await queryRunner.query(`
      CREATE TABLE "vulnerabilities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "evidenceId" uuid NOT NULL REFERENCES "evidence"("id") ON DELETE CASCADE,
        "cveId" varchar(50) NOT NULL,
        "severity" varchar(50) NOT NULL,
        "cvssScore" decimal(3,1),
        "cvssVector" varchar(255),
        "packageName" varchar(255) NOT NULL,
        "packageVersion" varchar(128) NOT NULL,
        "fixedVersion" varchar(128),
        "description" text NOT NULL,
        "references" jsonb NOT NULL DEFAULT '[]',
        "publishedDate" timestamptz,
        "modifiedDate" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_vulnerabilities_cve" ON "vulnerabilities" ("cveId")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vulnerabilities_evidence" ON "vulnerabilities" ("evidenceId", "cveId")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vulnerabilities_severity" ON "vulnerabilities" ("severity")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vulnerabilities_package" ON "vulnerabilities" ("packageName")`
    );

    // Create poam_items table
    await queryRunner.query(`
      CREATE TABLE "poam_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "vulnerabilityId" uuid NOT NULL,
        "title" varchar(512) NOT NULL,
        "description" text NOT NULL,
        "riskLevel" varchar(50) NOT NULL,
        "status" varchar(50) NOT NULL DEFAULT 'OPEN',
        "assignedTo" uuid,
        "dueDate" timestamptz,
        "remediationSteps" text NOT NULL,
        "affectedSystems" jsonb NOT NULL DEFAULT '[]',
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_poam_tenant_status" ON "poam_items" ("tenantId", "status")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_poam_vulnerability" ON "poam_items" ("vulnerabilityId")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_poam_due_date" ON "poam_items" ("dueDate")`
    );

    // Create policies table
    await queryRunner.query(`
      CREATE TABLE "policies" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "type" varchar(50) NOT NULL,
        "enforcementLevel" varchar(50) NOT NULL DEFAULT 'WARNING',
        "enabled" boolean NOT NULL DEFAULT true,
        "regoCode" text NOT NULL,
        "parameters" jsonb NOT NULL DEFAULT '{}',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "unique_tenant_policy" UNIQUE ("tenantId", "name")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_policies_tenant" ON "policies" ("tenantId")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_policies_type" ON "policies" ("type")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_policies_enabled" ON "policies" ("enabled")`
    );

    // Create policy_evaluations table
    await queryRunner.query(`
      CREATE TABLE "policy_evaluations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "policyId" uuid NOT NULL,
        "evidenceId" uuid,
        "passed" boolean NOT NULL,
        "violations" jsonb NOT NULL DEFAULT '[]',
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "evaluatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_policy_evaluations_policy" ON "policy_evaluations" ("policyId", "evaluatedAt")`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_policy_evaluations_evidence" ON "policy_evaluations" ("evidenceId")`
    );

    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "policy_evaluations"`);
    await queryRunner.query(`DROP TABLE "policies"`);
    await queryRunner.query(`DROP TABLE "poam_items"`);
    await queryRunner.query(`DROP TABLE "vulnerabilities"`);
    await queryRunner.query(`DROP TABLE "artifacts"`);
    await queryRunner.query(`DROP TABLE "evidence"`);
    await queryRunner.query(`DROP TABLE "builds"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
