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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';


const upload = multer({ storage: multer.memoryStorage() });
function verificarToken(req: express.Request & { usuarioActual?: any }, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenQuery = req.query.token as string | undefined;

  const token = authHeader ? authHeader.split(' ')[1] : tokenQuery;

  if (!token) {
    res.status(401).json({ error: 'No autorizado, falta token' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.usuarioActual = payload;
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
// Cambiar la propia contraseña
app.put('/auth/cambiar-password', verificarToken, async (req: any, res) => {
  const { passwordActual, passwordNueva } = req.body;
  const usuarioId = req.usuarioActual?.id;

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
  if (!passwordValida) {
    res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    return;
  }

  const passwordEncriptada = await bcrypt.hash(passwordNueva, 10);
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { password: passwordEncriptada },
  });

  res.json({ mensaje: 'Contraseña actualizada correctamente' });
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
  const { nombre, cargo, correo, oficinaId } = req.body;
  const empleado = await prisma.empleado.create({
    data: { nombre, cargo, correo, oficinaId },
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
  const { nombre, cargo, correo, oficinaId } = req.body;
  const empleado = await prisma.empleado.update({
    where: { id: Number(id) },
    data: { nombre, cargo, correo, oficinaId },
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
app.post('/activos', verificarToken, async (req: any, res) => {
  const {
    codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
    numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
    procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
    mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
    estado, antivirus, criterio, cargador, tecladoSerial, mouseSerial, adaptadorCorriente,
    impresoraConfigurada, serialImpresora, macComputador, telefonoMarcaModelo, ipTelefono,
    macTelefono, seguroLaptop, softwareSO, softwareCorporativo, softwareOtros, oficinaId, responsableId,
  } = req.body;
  const activo = await prisma.activo.create({
    data: {
      codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
      numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
      procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
      mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
      estado, antivirus, criterio, cargador, tecladoSerial, mouseSerial, adaptadorCorriente,
      impresoraConfigurada, serialImpresora, macComputador, telefonoMarcaModelo, ipTelefono,
      macTelefono, seguroLaptop, softwareSO, softwareCorporativo, softwareOtros, oficinaId, responsableId,
    },
  });
  await prisma.historialActivo.create({
    data: {
      activoId: activo.id,
      accion: 'creado',
      detalle: `Activo ${activo.codigo} creado`,
      usuario: req.usuarioActual?.nombre ?? 'Desconocido',
    },
  });
  res.json(activo);
});

// Obtener la plantilla del acta (crea una por defecto si no existe)
app.get('/plantilla-acta', verificarToken, async (req, res) => {
  let plantilla = await prisma.plantillaActa.findFirst();
  if (!plantilla) {
    plantilla = await prisma.plantillaActa.create({ data: {} });
  }
  res.json(plantilla);
});

// Generar el PDF del acta de entrega para un activo
// Generar el PDF del acta de entrega para un activo
app.get('/activos/:id/acta', verificarToken, async (req, res) => {
  const { id } = req.params;
  const nombreEntrega = (req.query.entrega as string) || '';
  const activo = await prisma.activo.findUnique({
    where: { id: Number(id) },
    include: { oficina: true, responsable: true },
  });

  if (!activo) {
    res.status(404).json({ error: 'Activo no encontrado' });
    return;
  }

  let plantilla = await prisma.plantillaActa.findFirst();
  if (!plantilla) {
    plantilla = await prisma.plantillaActa.create({ data: {} });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logoPath = path.join(__dirname, '..', 'client', 'src', 'assets', 'logo.png');
  const logoBytes = require('fs').readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const black = rgb(0, 0, 0);
  const lightGray = rgb(0.93, 0.93, 0.93);
  const white = rgb(1, 1, 1);

  let y = height - 30;
  const marginX = 30;
  const contentWidth = width - marginX * 2;

  function drawRect(x: number, yTop: number, w: number, h: number, fillColor: any) {
    page.drawRectangle({ x, y: yTop - h, width: w, height: h, borderColor: black, borderWidth: 0.7, color: fillColor });
  }

  function drawText(text: string, x: number, yPos: number, size = 8, bold = false) {
    page.drawText(text ?? '', { x, y: yPos, size, font: bold ? fontBold : font, color: black });
  }

  function wrapText(text: string, maxWidth: number, size: number, useFont: any) {
    const words = (text ?? '').split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      const w = useFont.widthOfTextAtSize(test, size);
      if (w > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // ===== ENCABEZADO =====
  const headerH = 70;
  const logoBoxW = 160;
  page.drawRectangle({ x: marginX, y: y - headerH, width: logoBoxW, height: headerH, borderColor: black, borderWidth: 0.7 });
  const logoDims = logoImage.scale(0.28);
  page.drawImage(logoImage, {
    x: marginX + (logoBoxW - logoDims.width) / 2,
    y: y - headerH + (headerH - logoDims.height) / 2,
    width: logoDims.width,
    height: logoDims.height,
  });

  const titleBoxW = 250;
  page.drawRectangle({ x: marginX + logoBoxW, y: y - headerH, width: titleBoxW, height: headerH, borderColor: black, borderWidth: 0.7 });
  const titleLines = wrapText(plantilla.tituloDocumento, titleBoxW - 20, 11, fontBold);
  let titleY = y - headerH / 2 + (titleLines.length * 13) / 2 - 10;
  titleLines.forEach((line) => {
    const tw = fontBold.widthOfTextAtSize(line, 11);
    drawText(line, marginX + logoBoxW + (titleBoxW - tw) / 2, titleY, 11, true);
    titleY -= 13;
  });

  const metaBoxX = marginX + logoBoxW + titleBoxW;
  const metaBoxW = contentWidth - logoBoxW - titleBoxW;
  const metaRows = [
    ['Código:', plantilla.codigo],
    ['Versión:', plantilla.version],
    ['Fecha de aprobación:', plantilla.fechaAprobacion],
    ['Responsable:', plantilla.responsable],
  ];
  const metaRowH = headerH / 4;
  metaRows.forEach((row, i) => {
    page.drawRectangle({ x: metaBoxX, y: y - metaRowH * (i + 1), width: metaBoxW, height: metaRowH, borderColor: black, borderWidth: 0.6 });
    drawText(row[0] + ' ' + row[1], metaBoxX + 4, y - metaRowH * (i + 1) + metaRowH / 2 - 3, 7);
  });

  y -= headerH;

  function sectionTitle(title: string, rowH = 16) {
    drawRect(marginX, y, contentWidth, rowH, lightGray);
    const tw = fontBold.widthOfTextAtSize(title, 9);
    drawText(title, marginX + (contentWidth - tw) / 2, y - rowH / 2 - 3, 9, true);
    y -= rowH;
  }

  // ===== DATOS DEL COLABORADOR =====
  sectionTitle('DATOS DEL COLABORADOR');

  const respNombre = activo.responsable?.nombre ?? '';
  const respCargo = activo.responsable?.cargo ?? '';
  const respCorreo = activo.responsable?.correo ?? '';
  const oficinaNombre = activo.oficina?.nombre ?? '';

  const colData = [
    ['Nombre', respNombre, 'Cargo', respCargo, 'IP Computador', activo.ip ?? ''],
    ['Correo', respCorreo, 'Área', activo.departamento ?? '', 'Oficina', oficinaNombre],
  ];
  const colWidths = [55, 140, 45, 140, 60, contentWidth - 55 - 140 - 45 - 140 - 60];
  const colRowH = 18;
  colData.forEach((row) => {
    let x = marginX;
    row.forEach((cell, i) => {
      const w = colWidths[i];
      const isLabel = i % 2 === 0;
      drawRect(x, y, w, colRowH, isLabel ? lightGray : white);
      drawText(cell, x + 3, y - colRowH / 2 - 3, 7, isLabel);
      x += w;
    });
    y -= colRowH;
  });

  // ===== HARDWARE =====
  sectionTitle('HARDWARE');

  const tipoOpciones = ['ESCRITORIO', 'LAPTOP', 'AIO', 'NUC'];
  const tipoTexto = (activo.tipo ?? '').toUpperCase();
  function tipoMarcado(op: string) {
    if (op === 'ESCRITORIO') return tipoTexto.includes('ESCRITORIO') || tipoTexto.includes('DESKTOP') || tipoTexto.includes('PC') || tipoTexto.includes('SERVIDOR');
    if (op === 'LAPTOP') return tipoTexto.includes('LAPTOP');
    if (op === 'AIO') return tipoTexto.includes('AIO');
    if (op === 'NUC') return tipoTexto.includes('NUC');
    return false;
  }

  function drawHwGroup(headers: string[], values: string[], primeraColTipo = false) {
    const colW = contentWidth / 5;
    const rowH = 22;
    let x = marginX;
    headers.forEach((h) => {
      drawRect(x, y, colW, rowH, lightGray);
      const lines = wrapText(h, colW - 6, 6, fontBold);
      let ly = y - 9;
      lines.forEach((line) => { drawText(line, x + 3, ly, 6, true); ly -= 7; });
      x += colW;
    });
    y -= rowH;
    x = marginX;
    const rowH2 = primeraColTipo ? 20 : 16;

    if (primeraColTipo) {
      drawRect(x, y, colW, rowH2, white);
      let cbX = x + 3;
      let cbY = y - 8;
      tipoOpciones.forEach((op, i) => {
        const marcado = tipoMarcado(op);
        const box = marcado ? '[X]' : '[ ]';
        drawText(`${box} ${op}`, cbX, cbY, 5.5, marcado);
        if (i % 2 === 0) {
          cbX += colW / 2;
        } else {
          cbX -= colW / 2;
          cbY -= 8;
        }
      });
      x += colW;
      for (let i = 1; i < values.length; i++) {
        drawRect(x, y, colW, rowH2, white);
        drawText(values[i] ?? '', x + 3, y - 12, 7);
        x += colW;
      }
    } else {
      values.forEach((v) => {
        drawRect(x, y, colW, rowH2, white);
        drawText(v ?? '', x + 3, y - 11, 7);
        x += colW;
      });
    }
    y -= rowH2;
  }

  drawHwGroup(
    ['TIPO', 'CARGADOR-ADAPTADOR DE CORRIENTE', 'MARCA EQUIPO', 'MODELO EQUIPO', 'NUMERO DE SERIE S/N'],
    ['', activo.cargador ?? '', activo.marca ?? '', activo.claseEquipo ?? '', activo.numeroSerie ?? ''],
    true
  );
  drawHwGroup(
    ['PROCESADOR', 'MEMORIA RAM (GB)', 'TIPO Y CAPACIDAD DE DISCO (GB)', 'TECLADO SERIAL', 'MOUSE SERIAL'],
    [activo.procesador ?? '', activo.ram ?? '', activo.disco ?? '', activo.tecladoSerial ?? '', activo.mouseSerial ?? '']
  );
  drawHwGroup(
    ['MONITOR', 'MONITOR SERIAL', 'ADAPTADOR CORRIENTE', 'IMPRESORA CONFIGURADA', 'SERIAL IMPRESORA'],
    [activo.monitor ?? '', activo.serieMonitor ?? '', activo.adaptadorCorriente ?? '', activo.impresoraConfigurada ?? '', activo.serialImpresora ?? '']
  );
  drawHwGroup(
    ['MAC COMPUTADOR', 'TELEFONO MARCA / MODELO', 'IP TELEFONO', 'MAC TELEFONO', 'SEGURO LAPTOP'],
    [activo.macComputador ?? '', activo.telefonoMarcaModelo ?? '', activo.ipTelefono ?? '', activo.macTelefono ?? '', activo.seguroLaptop ?? '']
  );

    // ===== SOFTWARE =====
  sectionTitle('SOFTWARE');

  const swColW = contentWidth / 3;
  const swHeaderH = 14;

  let hx = marginX;
  ['Software S.O', 'Software estándar corporativo', 'Otro software solicitado'].forEach((titulo) => {
    drawRect(hx, y, swColW, swHeaderH, lightGray);
    const tw = fontBold.widthOfTextAtSize(titulo, 7);
    drawText(titulo, hx + (swColW - tw) / 2, y - swHeaderH / 2 - 3, 7, true);
    hx += swColW;
  });
  y -= swHeaderH;

  function separarEnItems(texto: string | null): string[] {
    if (!texto) return [];
    return texto.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  }

  const itemsSO = separarEnItems(activo.softwareSO);
  const itemsCorporativo = separarEnItems(activo.softwareCorporativo);
  const itemsOtros = separarEnItems(activo.softwareOtros);

  const swMaxFilas = Math.max(itemsSO.length, itemsCorporativo.length, itemsOtros.length, 1);
  const swRowH = 12;

  for (let fila = 0; fila < swMaxFilas; fila++) {
    let sx = marginX;
    [itemsSO, itemsCorporativo, itemsOtros].forEach((lista) => {
      drawRect(sx, y, swColW, swRowH, white);
      const item = lista[fila];
      if (item) {
        const lines = wrapText(item, swColW - 8, 6.5, font);
        drawText(lines[0] ?? '', sx + 4, y - 8, 6.5);
      }
      sx += swColW;
    });
    y -= swRowH;
  }
  // ===== OBSERVACIONES =====
  sectionTitle('OBSERVACIONES');
  const obsLines = wrapText(plantilla.observaciones, contentWidth - 10, 7.5, font);
  const obsH = obsLines.length * 10 + 10;
  drawRect(marginX, y, contentWidth, obsH, white);
  let obsY = y - 12;
  obsLines.forEach((line) => { drawText(line, marginX + 5, obsY, 7.5); obsY -= 10; });
  y -= obsH;

  const clausulaLines = wrapText(plantilla.clausula, contentWidth - 10, 7.5, font);
  const clausulaH = clausulaLines.length * 10 + 10;
  drawRect(marginX, y, contentWidth, clausulaH, white);
  let clausY = y - 12;
  clausulaLines.forEach((line) => { drawText(line, marginX + 5, clausY, 7.5); clausY -= 10; });
  y -= clausulaH;

  // ===== FIRMAS =====
  sectionTitle('ENTREGA DE EQUIPO');
  const halfW = contentWidth / 2;
  drawRect(marginX, y, halfW, 16, lightGray);
  drawRect(marginX + halfW, y, halfW, 16, lightGray);
  drawText('RECIBE', marginX + halfW / 2 - 15, y - 12, 8, true);
  drawText('ENTREGA', marginX + halfW + halfW / 2 - 18, y - 12, 8, true);
  y -= 16;

  const hoy = new Date().toLocaleDateString('es-EC');
  const firmaRows = [
    ['Nombre', respNombre, 'Nombre', nombreEntrega],
    ['Firma', '', 'Firma', ''],
    ['Fecha', hoy, 'Fecha', hoy],
  ];
  firmaRows.forEach((row) => {
    const rowH = row[0] === 'Firma' ? 30 : 22;
    drawRect(marginX, y, halfW, rowH, white);
    drawRect(marginX + halfW, y, halfW, rowH, white);
    drawText(row[0], marginX + 4, y - 10, 7, true);
    if (row[1]) drawText(row[1], marginX + 4, y - 20, 7, true);
    drawText(row[2], marginX + halfW + 4, y - 10, 7, true);
    if (row[3]) drawText(row[3], marginX + halfW + 4, y - 20, 7, true);
    y -= rowH;
  });

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="acta-${activo.codigo}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

// Actualizar la plantilla del acta
app.put('/plantilla-acta/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { codigo, version, fechaAprobacion, responsable, tituloDocumento, clausula, observaciones, listaSoftware } = req.body;
  const plantilla = await prisma.plantillaActa.update({
    where: { id: Number(id) },
    data: { codigo, version, fechaAprobacion, responsable, tituloDocumento, clausula, observaciones, listaSoftware },
  });
  res.json(plantilla);
});

// Listar todos los activos (con oficina y responsable incluidos)
app.get('/activos', verificarToken, async (req, res) => {
  const activos = await prisma.activo.findMany({
    include: { oficina: true, responsable: true },
    orderBy: { codigo: 'asc' },
  });
  res.json(activos);
});

// Verificar si un código de activo ya existe
app.get('/activos/verificar-codigo/:codigo', verificarToken, async (req, res) => {
  const { codigo } = req.params;
  const existente = await prisma.activo.findUnique({ where: { codigo } });
  res.json({ existe: !!existente });
});

// Actualizar un activo
app.put('/activos/:id', verificarToken, async (req: any, res) => {
  const { id } = req.params;
  const {
    codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
    numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
    procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
    mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
    estado, antivirus, criterio, cargador, tecladoSerial, mouseSerial, adaptadorCorriente,
    impresoraConfigurada, serialImpresora, macComputador, telefonoMarcaModelo, ipTelefono,
    macTelefono, seguroLaptop, softwareSO, softwareCorporativo, softwareOtros, oficinaId, responsableId,
  } = req.body;
    const activoAnterior = await prisma.activo.findUnique({ where: { id: Number(id) } });

  const [todasOficinas, todosEmpleados] = await Promise.all([
    prisma.oficina.findMany(),
    prisma.empleado.findMany(),
  ]);
  const nombreOficina = (idOf: any) => todasOficinas.find((o) => o.id === Number(idOf))?.nombre ?? '(vacío)';
  const nombreEmpleado = (idEmp: any) => idEmp ? (todosEmpleados.find((e) => e.id === Number(idEmp))?.nombre ?? '(vacío)') : '(sin asignar)';

  const camposAComparar: Record<string, string> = {
    codigo: 'Código', tipo: 'Tipo', marca: 'Marca', claseEquipo: 'Clase de equipo',
    numeroSerie: 'Número de serie', estado: 'Estado', ip: 'IP',
    procesador: 'Procesador', ram: 'RAM', disco: 'Disco',
  };
  const cambios: string[] = [];
  const nuevosDatos: Record<string, any> = {
    codigo, tipo, marca, claseEquipo, numeroSerie, estado, ip, procesador, ram, disco,
  };
  for (const campo in camposAComparar) {
    const valorViejo = (activoAnterior as any)?.[campo];
    const valorNuevo = nuevosDatos[campo];
    if (String(valorViejo ?? '') !== String(valorNuevo ?? '')) {
      cambios.push(`${camposAComparar[campo]}: "${valorViejo ?? '(vacío)'}" → "${valorNuevo ?? '(vacío)'}"`);
    }
  }

  if (String(activoAnterior?.oficinaId ?? '') !== String(oficinaId ?? '')) {
    cambios.push(`Oficina: "${nombreOficina(activoAnterior?.oficinaId)}" → "${nombreOficina(oficinaId)}"`);
  }
  if (String(activoAnterior?.responsableId ?? '') !== String(responsableId ?? '')) {
    cambios.push(`Responsable: "${nombreEmpleado(activoAnterior?.responsableId)}" → "${nombreEmpleado(responsableId)}"`);
  }

  const detalleCambios = cambios.length > 0 ? cambios.join('; ') : 'Sin cambios detectados en campos principales';
  const activo = await prisma.activo.update({
    where: { id: Number(id) },
    data: {
      codigo, tipo, ip, macAddress, puertoRed, departamento, marca, claseEquipo,
      numeroSerie, monitor, serieMonitor, codigoContable, parlantes, placaMadre,
      procesador, ram, disco, estadoRaton, estadoTeclado, estadoDisco, sistemaOperativo,
      mantenimiento, actualizable, anydesk, upgrade, recomendacion, saleA, entraA,
      estado, antivirus, criterio, cargador, tecladoSerial, mouseSerial, adaptadorCorriente,
      impresoraConfigurada, serialImpresora, macComputador, telefonoMarcaModelo, ipTelefono,
      macTelefono, seguroLaptop, softwareSO, softwareCorporativo, softwareOtros, oficinaId, responsableId,
    },
  });
  await prisma.historialActivo.create({
    data: {
      activoId: activo.id,
      accion: 'editado',
      detalle: detalleCambios,
      usuario: req.usuarioActual?.nombre ?? 'Desconocido',
    },
  });
  res.json(activo);
});

// Eliminar un activo
app.delete('/activos/:id', verificarToken, async (req: any, res) => {
  const { id } = req.params;
  const activo = await prisma.activo.findUnique({ where: { id: Number(id) } });
  await prisma.activo.delete({
    where: { id: Number(id) },
  });
  await prisma.historialActivo.create({
    data: {
      activoId: Number(id),
      accion: 'eliminado',
      detalle: `Activo ${activo?.codigo ?? id} eliminado`,
      usuario: req.usuarioActual?.nombre ?? 'Desconocido',
    },
  });
  res.json({ mensaje: 'Activo eliminado' });
});
// Obtener el historial de cambios de un activo
app.get('/activos/:id/historial', verificarToken, async (req, res) => {
  const { id } = req.params;
  const historial = await prisma.historialActivo.findMany({
    where: { activoId: Number(id) },
    orderBy: { fecha: 'desc' },
  });
  res.json(historial);
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

