import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueCategoryNamePerOrg1789214335721 implements MigrationInterface {
    name = 'UniqueCategoryNamePerOrg1789214335721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_77fc37b8508399826a948cd9fca" UNIQUE ("name", "organization_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_77fc37b8508399826a948cd9fca"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
    }

}
