/*
  Warnings:

  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN "availabilities" JSONB;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Availability";
PRAGMA foreign_keys=on;
