import 'dotenv/config';
import cors from 'cors';
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import express from 'express';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const upload = multer({ storage: multer.memoryStorage() });
function verificarToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No autorizado, falta token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
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
app.post('/oficinas', verificarToken, async (req, res) => {
  const { nombre, direccion } = req.body;
  const oficina = await prisma.oficina.create({
    data: { nombre, direccion },
  });
  res.json(oficina);
});

// Listar todas las oficinas
app.get('/oficinas', verificarToken, async (req, res) => {
  const oficinas = await prisma.oficina.findMany();
  res.json(oficinas);
});

// Registrar un nuevo usuario
app.post('/auth/registro', async (req, res) => {
  const { nombre, correo, password } = req.body;

  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente) {
    res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    return;
  }

  const passwordEncriptada = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, correo, password: passwordEncriptada },
  });

  res.json({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo });
});

// Iniciar sesión
app.post('/auth/login', async (req, res) => {
  const { correo, password } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario) {
    res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    return;
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    return;
  }

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo } });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// Actualizar una oficina
app.put('/oficinas/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;
  const oficina = await prisma.oficina.update({
    where: { id: Number(id) },
    data: { nombre, direccion },
  });
  res.json(oficina);
});

// Eliminar una oficina
app.delete('/oficinas/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  await prisma.oficina.delete({
    where: { id: Number(id) },
  });
  res.json({ mensaje: 'Oficina eliminada' });
});
// Crear un empleado
app.post('/empleados', verificarToken, async (req, res) => {
  const { nombre, cargo, oficinaId } = req.body;
  const empleado = await prisma.empleado.create({
    data: { nombre, cargo, oficinaId },
  });
  res.json(empleado);
});

// Listar todos los empleados (incluyendo su oficina)
app.get('/empleados', verificarToken, async (req, res) => {
  const empleados = await prisma.empleado.findMany({
    include: { oficina: true },
  });
  res.json(empleados);
});

// Actualizar un empleado
app.put('/empleados/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, oficinaId } = req.body;
  const empleado = await prisma.empleado.update({
    where: { id: Number(id) },
    data: { nombre, cargo, oficinaId },
  });
  res.json(empleado);
});

// Eliminar un empleado
app.delete('/empleados/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  await prisma.empleado.delete({
    where: { id: Number(id) },
  });
  res.json({ mensaje: 'Empleado eliminado' });
});

// Crear un activo
app.post('/activos', verificarToken, async (req, res) => {
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
app.get('/activos', verificarToken, async (req, res) => {
  const activos = await prisma.activo.findMany({
    include: { oficina: true, responsable: true },
  });
  res.json(activos);
});

// Actualizar un activo
app.put('/activos/:id', verificarToken, async (req, res) => {
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
app.delete('/activos/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  await prisma.activo.delete({
    where: { id: Number(id) },
  });
  res.json({ mensaje: 'Activo eliminado' });
});

// Eliminar TODOS los activos
app.delete('/activos', verificarToken, async (req, res) => {
  const resultado = await prisma.activo.deleteMany({});
  res.json({ mensaje: `${resultado.count} activos eliminados` });
});

// Importar activos desde un archivo CSV
app.post('/activos/importar', verificarToken, upload.single('archivo'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No se recibió ningún archivo' });
    return;
  }

  const contenido = req.file.buffer.toString('utf-8');
  const filas = parse(contenido, { columns: true, skip_empty_lines: true });

  const oficinas = await prisma.oficina.findMany();
  const mapaOficinas: Record<string, number> = {};
  for (const of of oficinas) {
    mapaOficinas[of.nombre.trim().toUpperCase()] = of.id;
  }

  let creados = 0;
  const saltados: string[] = [];

  for (const fila of filas) {
    const nombreOficina = (fila.oficina || '').trim().toUpperCase();
    const oficinaId = mapaOficinas[nombreOficina];

    if (!oficinaId) {
      saltados.push(fila.codigo || '(sin código)');
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
      saltados.push(fila.codigo || '(sin código)');
    }
  }

  res.json({ creados, saltados: saltados.length, codigosSaltados: saltados });
});

