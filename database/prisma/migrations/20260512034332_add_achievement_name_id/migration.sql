/*
  Warnings:

  - The primary key for the `user_achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `achievementId` on the `user_achievements` table. All the data in the column will be lost.
  - Added the required column `achievementName_id` to the `user_achievements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievementId_fkey";

-- AlterTable
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_pkey",
DROP COLUMN "achievementId",
ADD COLUMN     "achievementName_id" VARCHAR(50) NOT NULL,
ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("userId", "achievementName_id");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementName_id_fkey" FOREIGN KEY ("achievementName_id") REFERENCES "achievements"("name_id") ON DELETE CASCADE ON UPDATE CASCADE;
