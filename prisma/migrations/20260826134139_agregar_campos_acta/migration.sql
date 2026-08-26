-- AlterTable
ALTER TABLE "Activo" ADD COLUMN     "adaptadorCorriente" TEXT,
ADD COLUMN     "cargador" TEXT,
ADD COLUMN     "impresoraConfigurada" TEXT,
ADD COLUMN     "ipTelefono" TEXT,
ADD COLUMN     "macComputador" TEXT,
ADD COLUMN     "macTelefono" TEXT,
ADD COLUMN     "mouseSerial" TEXT,
ADD COLUMN     "seguroLaptop" TEXT,
ADD COLUMN     "serialImpresora" TEXT,
ADD COLUMN     "softwareInstalado" TEXT,
ADD COLUMN     "tecladoSerial" TEXT,
ADD COLUMN     "telefonoMarcaModelo" TEXT;

-- CreateTable
CREATE TABLE "PlantillaActa" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL DEFAULT 'FO-TI-009',
    "version" TEXT NOT NULL DEFAULT '001',
    "fechaAprobacion" TEXT NOT NULL DEFAULT '',
    "responsable" TEXT NOT NULL DEFAULT 'Coordinador TICs',
    "tituloDocumento" TEXT NOT NULL DEFAULT 'ACTA DE ENTREGA DE EQUIPOS DE COMPUTO',
    "clausula" TEXT NOT NULL DEFAULT 'Certifico que los elementos detallados en el presente documento, me han sido entregados para mi cuidado y custodia con el propósito de cumplir con las tareas y asignaciones propias de mi cargo en la agencia, siendo estos de mi única y exclusiva responsabilidad. Me comprometo a usar correctamente los recursos, y solo para los fines establecidos, a no instalar ni permitir la instalación de software por personal ajeno al grupo interno de trabajo de soporte de TI.',
    "observaciones" TEXT NOT NULL DEFAULT 'Esta acta se entregará a partir de la revisión y mantenimiento del equipo.',
    "listaSoftware" TEXT NOT NULL DEFAULT 'Windows 10 PRO,Windows 11 PRO,Office 365 (Teams, Outlook, Word, Excel, etc.),Onedrive,Adobe Reader DC,Google Chrome,Compresor WinRAR,Anydesk,Forticlient,Pardus QQ,Zoom,Webex,R Studio,Filezilla,SafeNet (Token BCE),Firma EC,WebClientPrint,Mozilla Firefox',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantillaActa_pkey" PRIMARY KEY ("id")
);
