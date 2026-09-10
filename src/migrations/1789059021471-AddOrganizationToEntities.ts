import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationToEntities1789059021471 implements MigrationInterface {
    name = 'AddOrganizationToEntities1789059021471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "organization_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "organization_id" integer`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD "organization_id" integer`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_bfac25cac85a4c76e896d5cfa16" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_21a659804ed7bf61eb91688dea7" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_613ef43a793c628ad7b22981f33" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_613ef43a793c628ad7b22981f33"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_21a659804ed7bf61eb91688dea7"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_bfac25cac85a4c76e896d5cfa16"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "organization_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "organization_id"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "organization_id"`);
    }

}
