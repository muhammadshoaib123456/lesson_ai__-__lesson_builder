-- AlterTable
CREATE SEQUENCE "shooooo_schema".presentation_id_seq;
ALTER TABLE "shooooo_schema"."Presentation" ALTER COLUMN "id" SET DEFAULT nextval('"shooooo_schema".presentation_id_seq');
ALTER SEQUENCE "shooooo_schema".presentation_id_seq OWNED BY "shooooo_schema"."Presentation"."id";
