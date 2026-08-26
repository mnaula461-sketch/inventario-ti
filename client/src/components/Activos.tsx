import { useState, useEffect } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import ActivoDetalle from './ActivoDetalle';

interface Oficina {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
}

interface Activo {
  id: number;
  codigo: string;
  tipo: string;
  ip: string | null;
  macAddress: string | null;
  puertoRed: string | null;
  departamento: string | null;
  marca: string | null;
  claseEquipo: string | null;
  numeroSerie: string | null;
  monitor: string | null;
  serieMonitor: string | null;
  codigoContable: string | null;
  parlantes: string | null;
  placaMadre: string | null;
  procesador: string | null;
  ram: string | null;
  disco: string | null;
  estadoRaton: string | null;
  estadoTeclado: string | null;
  estadoDisco: string | null;
  sistemaOperativo: string | null;
  mantenimiento: string | null;
  actualizable: string | null;
  anydesk: string | null;
  upgrade: string | null;
  recomendacion: string | null;
  saleA: string | null;
  entraA: string | null;
  estado: string;
  antivirus: string | null;
  criterio: string | null;
  cargador: string | null;
  tecladoSerial: string | null;
  mouseSerial: string | null;
  adaptadorCorriente: string | null;
  impresoraConfigurada: string | null;
  serialImpresora: string | null;
  macComputador: string | null;
  telefonoMarcaModelo: string | null;
  ipTelefono: string | null;
  macTelefono: string | null;
  seguroLaptop: string | null;
  softwareSO: string | null;
  softwareCorporativo: string | null;
  softwareOtros: string | null;
  oficinaId: number;
  responsableId: number | null;
  oficina: Oficina;
  responsable: Empleado | null;
  createdAt: string;
}

const camposIniciales = {
  codigo: '', tipo: '', ip: '', macAddress: '', puertoRed: '', departamento: '',
  marca: '', claseEquipo: '', numeroSerie: '', monitor: '', serieMonitor: '',
  codigoContable: '', parlantes: '', placaMadre: '', procesador: '', ram: '',
  disco: '', estadoRaton: '', estadoTeclado: '', estadoDisco: '', sistemaOperativo: '',
  mantenimiento: '', actualizable: '', anydesk: '', upgrade: '', recomendacion: '',
  saleA: '', entraA: '', estado: 'activo', antivirus: '', criterio: '',
  cargador: '', tecladoSerial: '', mouseSerial: '', adaptadorCorriente: '',
  impresoraConfigurada: '', serialImpresora: '', macComputador: '', telefonoMarcaModelo: '',
  ipTelefono: '', macTelefono: '', seguroLaptop: '',
  softwareSO: '', softwareCorporativo: '', softwareOtros: '',
  oficinaId: '', responsableId: '',
};

const inputStyle = { width: '100%', padding: '0.4rem', fontSize: '0.9rem' };
const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };
const campoStyle = { marginBottom: '0.6rem' };

function Campo({ label, valor, onChange }: { label: string; valor: string; onChange: (v: string) => void }) {
  return (
    <div style={campoStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function BadgeEstado({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; color: string; texto: string }> = {
    activo: { bg: '#e7f6ee', color: '#1e8e5a', texto: 'Activo' },
    mantenimiento: { bg: '#fff4e0', color: '#b8790a', texto: 'Mantenimiento' },
    baja: { bg: '#fdeaea', color: '#dc3545', texto: 'Dado de baja' },
  };
  const c = config[estado] ?? { bg: '#eee', color: '#555', texto: estado };
  return (
    <span style={{
      backgroundColor: c.bg, color: c.color, padding: '0.25rem 0.6rem',
      borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
    }}>
      {c.texto}
    </span>
  );
}

function Activos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [form, setForm] = useState(camposIniciales);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [activoViendo, setActivoViendo] = useState<Activo | null>(null);

  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroOficina, setFiltroOficina] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');

  const [porPagina, setPorPagina] = useState(20);
  const [paginaActual, setPaginaActual] = useState(1);

  const cargarActivos = () => {
    api.get('/activos')
      .then((res) => setActivos(res.data))
      .catch((error) => console.error('Error al cargar activos:', error));
  };

  const cargarOficinas = () => {
    api.get('/oficinas')
      .then((res) => setOficinas(res.data))
      .catch((error) => console.error('Error al cargar oficinas:', error));
  };

  const cargarEmpleados = () => {
    api.get('/empleados')
      .then((res) => setEmpleados(res.data))
      .catch((error) => console.error('Error al cargar empleados:', error));
  };

  useEffect(() => {
    cargarActivos();
    cargarOficinas();
    cargarEmpleados();
  }, []);

  const actualizarCampo = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFormulario = () => {
    setForm(camposIniciales);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const guardarActivo = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      oficinaId: Number(form.oficinaId),
      responsableId: form.responsableId ? Number(form.responsableId) : null,
    };
    if (editandoId) {
      await api.put(`/activos/${editandoId}`, data);
    } else {
      await api.post('/activos', data);
    }
    limpiarFormulario();
    cargarActivos();
  };

  const empezarEdicion = (activo: Activo) => {
    setEditandoId(activo.id);
    setMostrarFormulario(true);
    setForm({
      codigo: activo.codigo ?? '',
      tipo: activo.tipo ?? '',
      ip: activo.ip ?? '',
      macAddress: activo.macAddress ?? '',
      puertoRed: activo.puertoRed ?? '',
      departamento: activo.departamento ?? '',
      marca: activo.marca ?? '',
      claseEquipo: activo.claseEquipo ?? '',
      numeroSerie: activo.numeroSerie ?? '',
      monitor: activo.monitor ?? '',
      serieMonitor: activo.serieMonitor ?? '',
      codigoContable: activo.codigoContable ?? '',
      parlantes: activo.parlantes ?? '',
      placaMadre: activo.placaMadre ?? '',
      procesador: activo.procesador ?? '',
      ram: activo.ram ?? '',
      disco: activo.disco ?? '',
      estadoRaton: activo.estadoRaton ?? '',
      estadoTeclado: activo.estadoTeclado ?? '',
      estadoDisco: activo.estadoDisco ?? '',
      sistemaOperativo: activo.sistemaOperativo ?? '',
      mantenimiento: activo.mantenimiento ?? '',
      actualizable: activo.actualizable ?? '',
      anydesk: activo.anydesk ?? '',
      upgrade: activo.upgrade ?? '',
      recomendacion: activo.recomendacion ?? '',
      saleA: activo.saleA ?? '',
      entraA: activo.entraA ?? '',
      estado: activo.estado ?? 'activo',
      antivirus: activo.antivirus ?? '',
      criterio: activo.criterio ?? '',
      cargador: activo.cargador ?? '',
      tecladoSerial: activo.tecladoSerial ?? '',
      mouseSerial: activo.mouseSerial ?? '',
      adaptadorCorriente: activo.adaptadorCorriente ?? '',
      impresoraConfigurada: activo.impresoraConfigurada ?? '',
      serialImpresora: activo.serialImpresora ?? '',
      macComputador: activo.macComputador ?? '',
      telefonoMarcaModelo: activo.telefonoMarcaModelo ?? '',
      ipTelefono: activo.ipTelefono ?? '',
      macTelefono: activo.macTelefono ?? '',
      seguroLaptop: activo.seguroLaptop ?? '',
      softwareSO: activo.softwareSO ?? '',
      softwareCorporativo: activo.softwareCorporativo ?? '',
      softwareOtros: activo.softwareOtros ?? '',
      oficinaId: String(activo.oficinaId),
      responsableId: activo.responsableId ? String(activo.responsableId) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarActivo = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este activo?');
    if (!confirmar) return;
    await api.delete(`/activos/${id}`);
    cargarActivos();
  };

  const importarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const res = await api.post('/activos/importar', formData);
      alert(`Importación completa: ${res.data.creados} creados, ${res.data.saltados} saltados (oficina no encontrada).`);
      cargarActivos();
    } catch (error) {
      alert('Error al importar el archivo.');
      console.error(error);
    }
    e.target.value = '';
  };

  const eliminarTodos = async () => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar TODOS los activos? Esta acción no se puede deshacer.');
    if (!confirmar) return;
    const confirmarDeNuevo = window.confirm('Última confirmación: se borrarán TODOS los registros de activos. ¿Continuar?');
    if (!confirmarDeNuevo) return;
    await api.delete('/activos');
    cargarActivos();
  };

  const exportarExcel = () => {
    const datos = activosFiltrados.map((a) => ({
      Código: a.codigo,
      Tipo: a.tipo,
      IP: a.ip,
      'MAC Address': a.macAddress,
      'Puerto de red': a.puertoRed,
      Departamento: a.departamento,
      Propietario: a.responsable?.nombre ?? '',
      'Ubicación / Oficina': a.oficina?.nombre,
      Marca: a.marca,
      'Clase equipo': a.claseEquipo,
      'Número de serie': a.numeroSerie,
      Monitor: a.monitor,
      'Serie monitor': a.serieMonitor,
      'Código contable': a.codigoContable,
      Parlantes: a.parlantes,
      'Placa madre': a.placaMadre,
      Procesador: a.procesador,
      'RAM (GB)': a.ram,
      Disco: a.disco,
      'Estado ratón': a.estadoRaton,
      'Estado teclado': a.estadoTeclado,
      'Estado disco': a.estadoDisco,
      'Sistema operativo': a.sistemaOperativo,
      Mantenimiento: a.mantenimiento,
      Actualizable: a.actualizable,
      Anydesk: a.anydesk,
      Upgrade: a.upgrade,
      Recomendación: a.recomendacion,
      'Sale a': a.saleA,
      'Entra a': a.entraA,
      Estado: a.estado,
      Antivirus: a.antivirus,
      Criterio: a.criterio,
      'Cargador/Adaptador': a.cargador,
      'Teclado serial': a.tecladoSerial,
      'Mouse serial': a.mouseSerial,
      'Adaptador corriente': a.adaptadorCorriente,
      'Impresora configurada': a.impresoraConfigurada,
      'Serial impresora': a.serialImpresora,
      'MAC computador': a.macComputador,
      'Teléfono marca/modelo': a.telefonoMarcaModelo,
      'IP teléfono': a.ipTelefono,
      'MAC teléfono': a.macTelefono,
      'Seguro laptop': a.seguroLaptop,
      'Software S.O': a.softwareSO,
      'Software corporativo': a.softwareCorporativo,
      'Otro software': a.softwareOtros,
    }));
    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Activos');
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(libro, `inventario-activos-${fecha}.xlsx`);
  };

  const buscar = () => {
    setBusquedaAplicada(busquedaTexto.toLowerCase());
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setBusquedaTexto('');
    setBusquedaAplicada('');
    setFiltroOficina('');
    setFiltroEstado('');
    setPaginaActual(1);
  };

  const activosFiltrados = activos.filter((activo) => {
    const coincideTexto = !busquedaAplicada || (
      activo.codigo.toLowerCase().includes(busquedaAplicada) ||
      activo.tipo.toLowerCase().includes(busquedaAplicada) ||
      (activo.marca ?? '').toLowerCase().includes(busquedaAplicada) ||
      (activo.responsable?.nombre ?? '').toLowerCase().includes(busquedaAplicada) ||
      (activo.departamento ?? '').toLowerCase().includes(busquedaAplicada) ||
      (activo.numeroSerie ?? '').toLowerCase().includes(busquedaAplicada)
    );
    const coincideOficina = !filtroOficina || activo.oficinaId === Number(filtroOficina);
    const coincideEstado = !filtroEstado || activo.estado === filtroEstado;
    return coincideTexto && coincideOficina && coincideEstado;
  });

  const totalPaginas = Math.max(1, Math.ceil(activosFiltrados.length / porPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const activosPagina = activosFiltrados.slice(inicio, inicio + porPagina);

  const cambiarPorPagina = (valor: number) => {
    setPorPagina(valor);
    setPaginaActual(1);
  };

  if (activoViendo) {
    return (
      <ActivoDetalle
        activo={activoViendo}
        onVolver={() => setActivoViendo(null)}
        onEditar={() => {
          empezarEdicion(activoViendo);
          setActivoViendo(null);
        }}
        onGenerarActa={() => {
          const sugerido = localStorage.getItem('nombreUsuario') ?? '';
          const nombreEntrega = window.prompt('¿Quién entrega el equipo?', sugerido);
          if (nombreEntrega === null) return;
          const token = localStorage.getItem('token');
          window.open(`http://localhost:3000/activos/${activoViendo.id}/acta?token=${token}&entrega=${encodeURIComponent(nombreEntrega)}`, '_blank');
        }}
      />
    );
  }

  return (
    <div>
      <h2 style={{ color: '#1f1b3d' }}>Activos</h2>

      <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        {!mostrarFormulario && (
          <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
            + Agregar activo
          </button>
        )}
        <label className="btn-outline" style={{ display: 'inline-block' }}>
          📤 Cargar Excel/CSV
          <input type="file" accept=".csv" onChange={importarArchivo} style={{ display: 'none' }} />
        </label>
        <button className="btn-outline" onClick={exportarExcel}>
          📊 Exportar a Excel
        </button>
        <button className="btn-delete" onClick={eliminarTodos} style={{ marginLeft: 'auto' }}>
          🗑️ Eliminar todos
        </button>
      </div>

      <div style={{ border: '1px solid #e2e0f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#fafaff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.8rem', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Buscar</label>
            <input
              type="text"
              placeholder="Código, tipo, marca, responsable, departamento o serie"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Oficina</label>
            <select value={filtroOficina} onChange={(e) => setFiltroOficina(e.target.value)} style={inputStyle}>
              <option value="">Todas</option>
              {oficinas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={inputStyle}>
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="mantenimiento">En mantenimiento</option>
              <option value="baja">Dado de baja</option>
            </select>
          </div>
          <button className="btn-primary" onClick={buscar}>Buscar</button>
          <button className="btn-outline" onClick={limpiarFiltros}>Limpiar</button>
        </div>
      </div>

      {mostrarFormulario && (
        <form onSubmit={guardarActivo} style={{ marginBottom: '2rem', border: '1px solid #e2e0f0', padding: '1.2rem', borderRadius: '10px', backgroundColor: '#fafaff' }}>
          <h3 style={{ color: '#1f1b3d' }}>Datos básicos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <div style={campoStyle}>
              <label style={labelStyle}>Código *</label>
              <input type="text" value={form.codigo} onChange={(e) => actualizarCampo('codigo', e.target.value)} required style={inputStyle} />
            </div>
            <div style={campoStyle}>
              <label style={labelStyle}>Tipo de equipo *</label>
              <input type="text" value={form.tipo} onChange={(e) => actualizarCampo('tipo', e.target.value)} required style={inputStyle} placeholder="Laptop, PC, Impresora..." />
            </div>
            <Campo label="Departamento" valor={form.departamento} onChange={(v) => actualizarCampo('departamento', v)} />
            <Campo label="Marca" valor={form.marca} onChange={(v) => actualizarCampo('marca', v)} />
            <Campo label="Clase de equipo" valor={form.claseEquipo} onChange={(v) => actualizarCampo('claseEquipo', v)} />
            <Campo label="Número de serie" valor={form.numeroSerie} onChange={(v) => actualizarCampo('numeroSerie', v)} />
            <Campo label="Código contable" valor={form.codigoContable} onChange={(v) => actualizarCampo('codigoContable', v)} />
            <div style={campoStyle}>
              <label style={labelStyle}>Oficina *</label>
              <select value={form.oficinaId} onChange={(e) => actualizarCampo('oficinaId', e.target.value)} required style={inputStyle}>
                <option value="">-- Selecciona --</option>
                {oficinas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div style={campoStyle}>
              <label style={labelStyle}>Responsable</label>
              <select value={form.responsableId} onChange={(e) => actualizarCampo('responsableId', e.target.value)} style={inputStyle}>
                <option value="">-- Sin asignar --</option>
                {empleados.map((emp) => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
              </select>
            </div>
          </div>

          <h3 style={{ color: '#1f1b3d' }}>Red</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <Campo label="IP" valor={form.ip} onChange={(v) => actualizarCampo('ip', v)} />
            <Campo label="MAC Address" valor={form.macAddress} onChange={(v) => actualizarCampo('macAddress', v)} />
            <Campo label="Puerto de red" valor={form.puertoRed} onChange={(v) => actualizarCampo('puertoRed', v)} />
            <Campo label="AnyDesk" valor={form.anydesk} onChange={(v) => actualizarCampo('anydesk', v)} />
          </div>

          <h3 style={{ color: '#1f1b3d' }}>Hardware</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <Campo label="Monitor" valor={form.monitor} onChange={(v) => actualizarCampo('monitor', v)} />
            <Campo label="Serie monitor" valor={form.serieMonitor} onChange={(v) => actualizarCampo('serieMonitor', v)} />
            <Campo label="Parlantes" valor={form.parlantes} onChange={(v) => actualizarCampo('parlantes', v)} />
            <Campo label="Placa madre" valor={form.placaMadre} onChange={(v) => actualizarCampo('placaMadre', v)} />
            <Campo label="Procesador" valor={form.procesador} onChange={(v) => actualizarCampo('procesador', v)} />
            <Campo label="RAM" valor={form.ram} onChange={(v) => actualizarCampo('ram', v)} />
            <Campo label="Disco" valor={form.disco} onChange={(v) => actualizarCampo('disco', v)} />
            <Campo label="Sistema operativo" valor={form.sistemaOperativo} onChange={(v) => actualizarCampo('sistemaOperativo', v)} />
          </div>

          <h3 style={{ color: '#1f1b3d' }}>Datos adicionales para acta de entrega</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <Campo label="Cargador/adaptador" valor={form.cargador} onChange={(v) => actualizarCampo('cargador', v)} />
            <Campo label="Teclado serial" valor={form.tecladoSerial} onChange={(v) => actualizarCampo('tecladoSerial', v)} />
            <Campo label="Mouse serial" valor={form.mouseSerial} onChange={(v) => actualizarCampo('mouseSerial', v)} />
            <Campo label="Adaptador de corriente" valor={form.adaptadorCorriente} onChange={(v) => actualizarCampo('adaptadorCorriente', v)} />
            <Campo label="Impresora configurada" valor={form.impresoraConfigurada} onChange={(v) => actualizarCampo('impresoraConfigurada', v)} />
            <Campo label="Serial impresora" valor={form.serialImpresora} onChange={(v) => actualizarCampo('serialImpresora', v)} />
            <Campo label="MAC computador" valor={form.macComputador} onChange={(v) => actualizarCampo('macComputador', v)} />
            <Campo label="Teléfono marca/modelo" valor={form.telefonoMarcaModelo} onChange={(v) => actualizarCampo('telefonoMarcaModelo', v)} />
            <Campo label="IP teléfono" valor={form.ipTelefono} onChange={(v) => actualizarCampo('ipTelefono', v)} />
            <Campo label="MAC teléfono" valor={form.macTelefono} onChange={(v) => actualizarCampo('macTelefono', v)} />
            <div style={campoStyle}>
              <label style={labelStyle}>Seguro laptop</label>
              <select value={form.seguroLaptop} onChange={(e) => actualizarCampo('seguroLaptop', e.target.value)} style={inputStyle}>
                <option value="">-- Sin especificar --</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div style={{ ...campoStyle, gridColumn: 'span 3' }}>
              <label style={labelStyle}>Software S.O (separados por coma)</label>
              <input type="text" value={form.softwareSO} onChange={(e) => actualizarCampo('softwareSO', e.target.value)} style={inputStyle} placeholder="Windows 11 PRO" />
            </div>
            <div style={{ ...campoStyle, gridColumn: 'span 3' }}>
              <label style={labelStyle}>Software estándar corporativo (separados por coma)</label>
              <input type="text" value={form.softwareCorporativo} onChange={(e) => actualizarCampo('softwareCorporativo', e.target.value)} style={inputStyle} placeholder="Office 365, Onedrive, Anydesk" />
            </div>
            <div style={{ ...campoStyle, gridColumn: 'span 3' }}>
              <label style={labelStyle}>Otro software solicitado (separados por coma)</label>
              <input type="text" value={form.softwareOtros} onChange={(e) => actualizarCampo('softwareOtros', e.target.value)} style={inputStyle} placeholder="Zoom, Webex" />
            </div>
          </div>

          <h3 style={{ color: '#1f1b3d' }}>Estado y mantenimiento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <Campo label="Estado mouse" valor={form.estadoRaton} onChange={(v) => actualizarCampo('estadoRaton', v)} />
            <Campo label="Estado teclado" valor={form.estadoTeclado} onChange={(v) => actualizarCampo('estadoTeclado', v)} />
            <Campo label="Estado disco" valor={form.estadoDisco} onChange={(v) => actualizarCampo('estadoDisco', v)} />
            <Campo label="Mantenimiento" valor={form.mantenimiento} onChange={(v) => actualizarCampo('mantenimiento', v)} />
            <Campo label="Actualizable" valor={form.actualizable} onChange={(v) => actualizarCampo('actualizable', v)} />
            <Campo label="Upgrade" valor={form.upgrade} onChange={(v) => actualizarCampo('upgrade', v)} />
            <Campo label="Recomendación" valor={form.recomendacion} onChange={(v) => actualizarCampo('recomendacion', v)} />
            <Campo label="Sale a" valor={form.saleA} onChange={(v) => actualizarCampo('saleA', v)} />
            <Campo label="Entra a" valor={form.entraA} onChange={(v) => actualizarCampo('entraA', v)} />
            <div style={campoStyle}>
              <label style={labelStyle}>Estado</label>
              <select value={form.estado} onChange={(e) => actualizarCampo('estado', e.target.value)} style={inputStyle}>
                <option value="activo">Activo</option>
                <option value="mantenimiento">En mantenimiento</option>
                <option value="baja">Dado de baja</option>
              </select>
            </div>
            <Campo label="Antivirus" valor={form.antivirus} onChange={(v) => actualizarCampo('antivirus', v)} />
            <Campo label="Criterio" valor={form.criterio} onChange={(v) => actualizarCampo('criterio', v)} />
          </div>

          <div style={{ marginTop: '1.2rem' }}>
            <button type="submit" className="btn-primary" style={{ marginRight: '0.5rem' }}>
              {editandoId ? 'Guardar cambios' : 'Agregar activo'}
            </button>
            <button type="button" className="btn-outline" onClick={limpiarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
          Mostrando {activosPagina.length ? inicio + 1 : 0}–{inicio + activosPagina.length} de {activosFiltrados.length} activos
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Mostrar:</span>
          {[10, 20, 30, 50].map((n) => (
            <button
              key={n}
              onClick={() => cambiarPorPagina(n)}
              className={porPagina === n ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Código</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Marca</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Oficina</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Responsable</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Estado</th>
            <th style={{ padding: '0.5rem', width: '140px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activosPagina.map((activo) => (
            <tr key={activo.id}>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.codigo}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.tipo}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.marca}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.oficina?.nombre}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.responsable?.nombre ?? '—'}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                <BadgeEstado estado={activo.estado} />
              </td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                  <button className="btn-outline" onClick={() => setActivoViendo(activo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    👁️
                  </button>
                  <button className="btn-edit" onClick={() => empezarEdicion(activo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    ✏️
                  </button>
                  <button className="btn-delete" onClick={() => eliminarActivo(activo.id)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
        <button
          className="btn-outline"
          disabled={paginaSegura === 1}
          onClick={() => setPaginaActual(paginaSegura - 1)}
          style={{ opacity: paginaSegura === 1 ? 0.4 : 1 }}
        >
          ← Anterior
        </button>
        <span style={{ fontSize: '0.9rem', color: '#444' }}>
          Página {paginaSegura} de {totalPaginas}
        </span>
        <button
          className="btn-outline"
          disabled={paginaSegura === totalPaginas}
          onClick={() => setPaginaActual(paginaSegura + 1)}
          style={{ opacity: paginaSegura === totalPaginas ? 0.4 : 1 }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export default Activos;