import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add packages table for SBOM package storage
 * Supports Phase 1 of M2: Database persistence for parsed SBOM packages
 */
export class AddPackagesTable1734369600000 implements MigrationInterface {
  name = 'AddPackagesTable1734369600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create packages table
    await queryRunner.query(`
      CREATE TABLE "packages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "evidenceId" uuid NOT NULL REFERENCES "evidence"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "version" varchar(128) NOT NULL,
        "supplier" varchar(255),
        "downloadLocation" varchar(512),
        "licenseConcluded" varchar(255),
        "licenseDeclared" varchar(255),
        "copyrightText" text,
        "purl" varchar(512),
        "cpe" varchar(512),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    // Create indexes for efficient querying
    await queryRunner.query(
      `CREATE INDEX "idx_packages_evidence" ON "packages" ("evidenceId")`
    );

    await queryRunner.query(
      `CREATE INDEX "idx_packages_name_version" ON "packages" ("name", "version")`
    );

    await queryRunner.query(
      `CREATE INDEX "idx_packages_purl" ON "packages" ("purl") WHERE "purl" IS NOT NULL`
    );

    await queryRunner.query(
      `CREATE INDEX "idx_packages_cpe" ON "packages" ("cpe") WHERE "cpe" IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_packages_cpe"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_packages_purl"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_packages_name_version"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_packages_evidence"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "packages"`);
  }
}
