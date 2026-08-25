/*
  Warnings:

  - You are about to drop the column `costo` on the `Activo` table. All the data in the column will be lost.
  - You are about to drop the column `fechaCompra` on the `Activo` table. All the data in the column will be lost.
  - You are about to drop the column `modelo` on the `Activo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activo" DROP COLUMN "costo",
DROP COLUMN "fechaCompra",
DROP COLUMN "modelo",
ADD COLUMN     "actualizable" TEXT,
ADD COLUMN     "antivirus" TEXT,
ADD COLUMN     "anydesk" TEXT,
ADD COLUMN     "claseEquipo" TEXT,
ADD COLUMN     "codigoContable" TEXT,
ADD COLUMN     "criterio" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "disco" TEXT,
ADD COLUMN     "entraA" TEXT,
ADD COLUMN     "estadoDisco" TEXT,
ADD COLUMN     "estadoRaton" TEXT,
ADD COLUMN     "estadoTeclado" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "macAddress" TEXT,
ADD COLUMN     "mantenimiento" TEXT,
ADD COLUMN     "monitor" TEXT,
ADD COLUMN     "parlantes" TEXT,
ADD COLUMN     "placaMadre" TEXT,
ADD COLUMN     "procesador" TEXT,
ADD COLUMN     "puertoRed" TEXT,
ADD COLUMN     "ram" TEXT,
ADD COLUMN     "recomendacion" TEXT,
ADD COLUMN     "saleA" TEXT,
ADD COLUMN     "serieMonitor" TEXT,
ADD COLUMN     "sistemaOperativo" TEXT,
ADD COLUMN     "upgrade" TEXT;
