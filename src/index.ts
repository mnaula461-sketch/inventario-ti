import 'dotenv/config';
import cors from 'cors';
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import express from 'express';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡El servidor de Inventario TI está funcionando! 🚀');
});

// Crear una oficina
app.post('/oficinas', async (req, res) => {
  const { nombre, direccion } = req.body;
  const oficina = await prisma.oficina.create({
    data: { nombre, direccion },
  });
  res.json(oficina);
});

// Listar todas las oficinas
app.get('/oficinas', async (req, res) => {
  const oficinas = await prisma.oficina.findMany();
  res.json(oficinas);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// Actualizar una oficina
app.put('/oficinas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;
  const oficina = await prisma.oficina.update({
    where: { id: Number(id) },
    data: { nombre, direccion },
  });
  res.json(oficina);
});

// Eliminar una oficina
app.delete('/oficinas/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.oficina.delete({
    where: { id: Number(id) },
  });
  res.json({ mensaje: 'Oficina eliminada' });
});
// Crear un empleado
app.post('/empleados', async (req, res) => {
  const { nombre, cargo, oficinaId } = req.body;
  const empleado = await prisma.empleado.create({
    data: { nombre, cargo, oficinaId },
  });
  res.json(empleado);
});

// Listar todos los empleados (incluyendo su oficina)
app.get('/empleados', async (req, res) => {
  const empleados = await prisma.empleado.findMany({
    include: { oficina: true },
  });
  res.json(empleados);
});

// Actualizar un empleado
app.put('/empleados/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, oficinaId } = req.body;
  const empleado = await prisma.empleado.update({
    where: { id: Number(id) },
    data: { nombre, cargo, oficinaId },
  });
  res.json(empleado);
});

// Eliminar un empleado
app.delete('/empleados/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.empleado.delete({
    where: { id: Number(id) },
  });
  res.json({ mensaje: 'Empleado eliminado' });
});

// Crear un activo
app.post('/activos', async (req, res) => {
  const {
    codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
    numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
    procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
    mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
    estado, antivirus, criterio, oficinaId, responsableId,
  } = req.body;
  const activo = await prisma.activo.create({
    data: {
      codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
      numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
      procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
      mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
      estado, antivirus, criterio, oficinaId, responsableId,
    },
  });
  res.json(activo);
});

// Listar todos los activos (con oficina y responsable incluidos)
app.get('/activos', async (req, res) => {
  const activos = await prisma.activo.findMany({
    include: { oficina: true, responsable: true },
  });
  res.json(activos);
});

// Actualizar un activo
app.put('/activos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
    numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
    procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
    mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
    estado, antivirus, criterio, oficinaId, responsableId,
  } = req.body;
  const activo = await prisma.activo.update({
    where: { id: Number(id) },
    data: {
      codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
      numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
      procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
      mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
      estado, antivirus, criterio, oficinaId, responsableId,
    },
  });
  res.json(activo);
});

// Eliminar un activo
app.delete('/activos/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.activo.delete({
    where: { id: Number(id) },
  });
  res.json({ mensaje: 'Activo eliminado' });
});