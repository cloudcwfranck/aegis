import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeRegoCodeOptional1734480000000 implements MigrationInterface {
  name = 'MakeRegoCodeOptional1734480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set default value for regoCode column
    await queryRunner.query(
      `ALTER TABLE "policies" ALTER COLUMN "regoCode" SET DEFAULT ''`
    );

    // Update existing NULL values to empty string
    await queryRunner.query(
      `UPDATE "policies" SET "regoCode" = '' WHERE "regoCode" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove default value
    await queryRunner.query(
      `ALTER TABLE "policies" ALTER COLUMN "regoCode" DROP DEFAULT`
    );
  }
}
