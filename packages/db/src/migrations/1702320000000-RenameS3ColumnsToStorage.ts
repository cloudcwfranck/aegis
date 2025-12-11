import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameS3ColumnsToStorage1702320000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename columns in evidence table to be cloud-agnostic
    await queryRunner.query(`
      ALTER TABLE "evidence"
      RENAME COLUMN "s3Uri" TO "storageUri";
    `);

    await queryRunner.query(`
      ALTER TABLE "evidence"
      RENAME COLUMN "s3Bucket" TO "storageContainer";
    `);

    await queryRunner.query(`
      ALTER TABLE "evidence"
      RENAME COLUMN "s3Key" TO "storageKey";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert column names
    await queryRunner.query(`
      ALTER TABLE "evidence"
      RENAME COLUMN "storageUri" TO "s3Uri";
    `);

    await queryRunner.query(`
      ALTER TABLE "evidence"
      RENAME COLUMN "storageContainer" TO "s3Bucket";
    `);

    await queryRunner.query(`
      ALTER TABLE "evidence"
      RENAME COLUMN "storageKey" TO "s3Key";
    `);
  }
}
