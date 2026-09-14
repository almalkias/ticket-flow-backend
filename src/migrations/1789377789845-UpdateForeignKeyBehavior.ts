import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateForeignKeyBehavior1789377789845 implements MigrationInterface {
    name = 'UpdateForeignKeyBehavior1789377789845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_47c3fba35bfcbb08e3445f57d6e"`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_47c3fba35bfcbb08e3445f57d6e" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_47c3fba35bfcbb08e3445f57d6e"`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_47c3fba35bfcbb08e3445f57d6e" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
