/*
  Warnings:

  - You are about to drop the column `softwareInstalado` on the `Activo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activo" DROP COLUMN "softwareInstalado",
ADD COLUMN     "softwareCorporativo" TEXT,
ADD COLUMN     "softwareOtros" TEXT,
ADD COLUMN     "softwareSO" TEXT;
