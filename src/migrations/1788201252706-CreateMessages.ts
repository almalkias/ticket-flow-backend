import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessages1788201252706 implements MigrationInterface {
  name = 'CreateMessages1788201252706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."messages_sender_type_enum" AS ENUM('customer', 'agent')`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" SERIAL NOT NULL, "body" text NOT NULL, "is_internal" boolean NOT NULL DEFAULT false, "sender_type" "public"."messages_sender_type_enum" NOT NULL, "sender_user_id" integer, "sender_name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_aa8e62e23565f59d22160b35f18" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_aa8e62e23565f59d22160b35f18"`,
    );
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TYPE "public"."messages_sender_type_enum"`);
  }
}
