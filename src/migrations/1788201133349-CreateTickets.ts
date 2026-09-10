import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTickets1788201133349 implements MigrationInterface {
  name = 'CreateTickets1788201133349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum" AS ENUM('open', 'in_progress', 'resolved', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tickets" ("id" SERIAL NOT NULL, "reference_number" character varying NOT NULL, "customer_name" character varying NOT NULL, "customer_email" character varying NOT NULL, "subject" character varying NOT NULL, "description" text NOT NULL, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'open', "priority" "public"."tickets_priority_enum" NOT NULL DEFAULT 'low', "resolved_at" TIMESTAMP, "closed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "category_id" integer, "assigned_to" integer, CONSTRAINT "UQ_0f1e1602af352df15b940726faa" UNIQUE ("reference_number"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_32a7f0e4e32a46a094b55f7c25c" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_47c3fba35bfcbb08e3445f57d6e" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_47c3fba35bfcbb08e3445f57d6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_32a7f0e4e32a46a094b55f7c25c"`,
    );
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
  }
}
