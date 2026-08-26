-- CreateTable
CREATE TABLE "HistorialActivo" (
    "id" SERIAL NOT NULL,
    "activoId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "usuario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialActivo_pkey" PRIMARY KEY ("id")
);
