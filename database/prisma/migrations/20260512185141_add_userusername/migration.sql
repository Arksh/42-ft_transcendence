/*
  Warnings:

  - The primary key for the `user_achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `user_achievements` table. All the data in the column will be lost.
  - Added the required column `userusername` to the `user_achievements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_userId_fkey";

-- AlterTable
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userusername" TEXT NOT NULL,
ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("userusername", "achievementName_id");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userusername_fkey" FOREIGN KEY ("userusername") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
