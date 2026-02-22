/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileCompleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "profileCompleted",
DROP COLUMN "updatedAt",
ADD COLUMN     "lossCountDoubles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lossCountSingles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingDoubles" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "ratingMuDoubles" DOUBLE PRECISION NOT NULL DEFAULT 1500,
ADD COLUMN     "ratingMuSingles" DOUBLE PRECISION NOT NULL DEFAULT 1500,
ADD COLUMN     "ratingPhiDoubles" DOUBLE PRECISION NOT NULL DEFAULT 350,
ADD COLUMN     "ratingPhiSingles" DOUBLE PRECISION NOT NULL DEFAULT 350,
ADD COLUMN     "ratingSigmaDoubles" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
ADD COLUMN     "ratingSigmaSingles" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
ADD COLUMN     "ratingSingles" INTEGER NOT NULL DEFAULT 1500,
ADD COLUMN     "winCountDoubles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winCountSingles" INTEGER NOT NULL DEFAULT 0;
