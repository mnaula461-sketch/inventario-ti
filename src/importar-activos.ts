import 'dotenv/config';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function importar() {
  const contenido = fs.readFileSync('activos_importar.csv', 'utf-8');
  const filas = parse(contenido, { columns: true, skip_empty_lines: true });

  const oficinas = await prisma.oficina.findMany();
  const mapaOficinas: Record<string, number> = {};
  for (const of of oficinas) {
    mapaOficinas[of.nombre.trim().toUpperCase()] = of.id;
  }

  let creados = 0;
  let saltados = 0;

  for (const fila of filas) {
    const nombreOficina = fila.oficina.trim().toUpperCase();
    const oficinaId = mapaOficinas[nombreOficina];

    if (!oficinaId) {
      console.log(`Saltado (oficina no encontrada: "${fila.oficina}"): ${fila.codigo}`);
      saltados++;
      continue;
    }

    try {
      await prisma.activo.create({
        data: {
          codigo: fila.codigo,
          tipo: fila.tipo,
          ip: fila.ip || null,
          macAddress: fila.macAddress || null,
          puertoRed: fila.puertoRed || null,
          departamento: fila.departamento || null,
          marca: fila.marca || null,
          claseEquipo: fila.claseEquipo || null,
          numeroSerie: fila.numeroSerie || null,
          monitor: fila.monitor || null,
          serieMonitor: fila.serieMonitor || null,
          codigoContable: fila.codigoContable || null,
          parlantes: fila.parlantes || null,
          placaMadre: fila.placaMadre || null,
          procesador: fila.procesador || null,
          ram: fila.ram || null,
          disco: fila.disco || null,
          estadoRaton: fila.estadoRaton || null,
          estadoTeclado: fila.estadoTeclado || null,
          estadoDisco: fila.estadoDisco || null,
          sistemaOperativo: fila.sistemaOperativo || null,
          mantenimiento: fila.mantenimiento || null,
          actualizable: fila.actualizable || null,
          anydesk: fila.anydesk || null,
          upgrade: fila.upgrade || null,
          recomendacion: fila.recomendacion || null,
          saleA: fila.saleA || null,
          entraA: fila.entraA || null,
          estado: 'activo',
          antivirus: fila.antivirus || null,
          criterio: fila.criterio || null,
          oficinaId: oficinaId,
          responsableId: null,
        },
      });
      creados++;
    } catch (error) {
      console.log(`Error con código "${fila.codigo}":`, error);
      saltados++;
    }
  }

  console.log(`\nImportación terminada: ${creados} creados, ${saltados} saltados.`);
  await prisma.$disconnect();
}

importar();