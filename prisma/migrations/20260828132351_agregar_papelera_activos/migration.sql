-- AlterTable
ALTER TABLE "Activo" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaEliminado" TIMESTAMP(3);
