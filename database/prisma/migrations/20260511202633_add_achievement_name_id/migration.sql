/*
  Warnings:

  - A unique constraint covering the columns `[name_id]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name_id` to the `achievements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "name_id" VARCHAR(50) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_id_key" ON "achievements"("name_id");
