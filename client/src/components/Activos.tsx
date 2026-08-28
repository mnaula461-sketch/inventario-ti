import { useState, useEffect, useRef } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import ActivoDetalle from './ActivoDetalle';
import Notificacion from './Notificacion';
import ModalConfirmar from './ModalConfirmar';
import SelectorBusqueda from './SelectorBusqueda';

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
  costo: number | null;
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
  softwareSO: '', softwareCorporativo: '', softwareOtros: '', costo: '',
  oficinaId: '', responsableId: '',
};

const inputStyle = { width: '100%', padding: '0.4rem', fontSize: '0.9rem' };
const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };
const campoStyle = { marginBottom: '0.6rem' };

const TODAS_LAS_COLUMNAS = [
  { campo: 'codigo', etiqueta: 'Código' },
  { campo: 'tipo', etiqueta: 'Tipo' },
  { campo: 'marca', etiqueta: 'Marca' },
  { campo: 'claseEquipo', etiqueta: 'Clase de equipo' },
  { campo: 'numeroSerie', etiqueta: 'Número de serie' },
  { campo: 'oficina', etiqueta: 'Oficina' },
  { campo: 'responsable', etiqueta: 'Responsable' },
  { campo: 'departamento', etiqueta: 'Departamento' },
  { campo: 'ip', etiqueta: 'IP' },
  { campo: 'macAddress', etiqueta: 'MAC Address' },
  { campo: 'procesador', etiqueta: 'Procesador' },
  { campo: 'ram', etiqueta: 'RAM' },
  { campo: 'disco', etiqueta: 'Disco' },
  { campo: 'sistemaOperativo', etiqueta: 'Sistema operativo' },
  { campo: 'estado', etiqueta: 'Estado' },
  { campo: 'antivirus', etiqueta: 'Antivirus' },
  { campo: 'mantenimiento', etiqueta: 'Mantenimiento' },
];

const COLUMNAS_POR_DEFECTO = ['codigo', 'tipo', 'marca', 'oficina', 'responsable', 'estado'];

function obtenerValorColumna(activo: Activo, campo: string): string {
  if (campo === 'oficina') return activo.oficina?.nombre ?? '';
  if (campo === 'responsable') return activo.responsable?.nombre ?? '—';
  return String((activo as any)[campo] ?? '');
}

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

  const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [vistaCompacta, setVistaCompacta] = useState(() => localStorage.getItem('vistaCompactaActivos') === 'true');

  const alternarDensidad = () => {
    setVistaCompacta((prev) => {
      const nuevo = !prev;
      localStorage.setItem('vistaCompactaActivos', String(nuevo));
      return nuevo;
    });
  };

  const alternarSeleccion = (id: number) => {
    setSeleccionados((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const generarActaLote = () => {
    if (seleccionados.length === 0) return;
    const sugerido = sessionStorage.getItem('nombreUsuario') ?? '';
    const nombreEntrega = window.prompt('¿Quién entrega los equipos?', sugerido);
    if (nombreEntrega === null) return;
    const token = sessionStorage.getItem('token');
    const ids = seleccionados.join(',');
    window.open(`http://localhost:3000/activos/actas-lote?ids=${ids}&entrega=${encodeURIComponent(nombreEntrega)}&token=${token}`, '_blank');
  };

  const [notiVisible, setNotiVisible] = useState(false);
  const [notiMensaje, setNotiMensaje] = useState('');

  const mostrarNotificacion = (mensaje: string) => {
    setNotiMensaje(mensaje);
    setNotiVisible(true);
    setTimeout(() => setNotiVisible(false), 3000);
  };

  const [codigoDuplicado, setCodigoDuplicado] = useState(false);
  const [soloSinResponsable, setSoloSinResponsable] = useState(false);

  const [columnasVisibles, setColumnasVisibles] = useState<string[]>(() => {
    const guardadas = localStorage.getItem('columnasActivos');
    return guardadas ? JSON.parse(guardadas) : COLUMNAS_POR_DEFECTO;
  });
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const menuColumnasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickFuera(e: MouseEvent) {
      if (menuColumnasRef.current && !menuColumnasRef.current.contains(e.target as Node)) {
        setMenuColumnasAbierto(false);
      }
    }
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  const alternarColumna = (campo: string) => {
    setColumnasVisibles((prev) => {
      const nuevo = prev.includes(campo) ? prev.filter((c) => c !== campo) : [...prev, campo];
      localStorage.setItem('columnasActivos', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const restaurarColumnasDefecto = () => {
    setColumnasVisibles(COLUMNAS_POR_DEFECTO);
    localStorage.setItem('columnasActivos', JSON.stringify(COLUMNAS_POR_DEFECTO));
  };

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

  useEffect(() => {
    if (!form.codigo.trim() || editandoId) {
      setCodigoDuplicado(false);
      return;
    }
    const timeout = setTimeout(() => {
      api.get(`/activos/verificar-codigo/${encodeURIComponent(form.codigo.trim())}`)
        .then((res) => setCodigoDuplicado(res.data.existe))
        .catch(() => {});
    }, 400);
    return () => clearTimeout(timeout);
  }, [form.codigo, editandoId]);

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
    if (codigoDuplicado) {
      alert('No se puede guardar: el código ya existe en otro activo.');
      return;
    }
    const data = {
      ...form,
      costo: form.costo ? Number(form.costo) : null,
      oficinaId: Number(form.oficinaId),
      responsableId: form.responsableId ? Number(form.responsableId) : null,
    };
    if (editandoId) {
      await api.put(`/activos/${editandoId}`, data);
      mostrarNotificacion('Activo actualizado correctamente');
    } else {
      await api.post('/activos', data);
      mostrarNotificacion('Activo agregado correctamente');
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
      costo: activo.costo != null ? String(activo.costo) : '',
      oficinaId: String(activo.oficinaId),
      responsableId: activo.responsableId ? String(activo.responsableId) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

    const duplicarActivo = (activo: Activo) => {
    setEditandoId(null);
    setMostrarFormulario(true);
    setForm({
      codigo: '',
      tipo: activo.tipo ?? '',
      ip: '',
      macAddress: '',
      puertoRed: activo.puertoRed ?? '',
      departamento: activo.departamento ?? '',
      marca: activo.marca ?? '',
      claseEquipo: activo.claseEquipo ?? '',
      numeroSerie: '',
      monitor: activo.monitor ?? '',
      serieMonitor: '',
      codigoContable: '',
      parlantes: activo.parlantes ?? '',
      placaMadre: activo.placaMadre ?? '',
      procesador: activo.procesador ?? '',
      ram: activo.ram ?? '',
      disco: activo.disco ?? '',
      estadoRaton: activo.estadoRaton ?? '',
      estadoTeclado: activo.estadoTeclado ?? '',
      estadoDisco: activo.estadoDisco ?? '',
      sistemaOperativo: activo.sistemaOperativo ?? '',
      mantenimiento: '',
      actualizable: activo.actualizable ?? '',
      anydesk: '',
      upgrade: activo.upgrade ?? '',
      recomendacion: '',
      saleA: '',
      entraA: '',
      estado: 'activo',
      antivirus: activo.antivirus ?? '',
      criterio: activo.criterio ?? '',
      cargador: activo.cargador ?? '',
      tecladoSerial: '',
      mouseSerial: '',
      adaptadorCorriente: activo.adaptadorCorriente ?? '',
      impresoraConfigurada: activo.impresoraConfigurada ?? '',
      serialImpresora: '',
      macComputador: '',
      telefonoMarcaModelo: activo.telefonoMarcaModelo ?? '',
      ipTelefono: '',
      macTelefono: '',
      seguroLaptop: activo.seguroLaptop ?? '',
      softwareSO: activo.softwareSO ?? '',
      softwareCorporativo: activo.softwareCorporativo ?? '',
      softwareOtros: activo.softwareOtros ?? '',
      oficinaId: String(activo.oficinaId),
      responsableId: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [activoAEliminar, setActivoAEliminar] = useState<Activo | null>(null);

  const pedirEliminar = (activo: Activo) => {
    setActivoAEliminar(activo);
  };

  const confirmarEliminar = async () => {
    if (!activoAEliminar) return;
    await api.delete(`/activos/${activoAEliminar.id}`);
    mostrarNotificacion('Activo movido a la papelera');
    setActivoAEliminar(null);
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
    setSoloSinResponsable(false);
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
    const coincideResponsable = !soloSinResponsable || !activo.responsableId;
    return coincideTexto && coincideOficina && coincideEstado && coincideResponsable;
  });

  const totalPaginas = Math.max(1, Math.ceil(activosFiltrados.length / porPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const activosPagina = activosFiltrados.slice(inicio, inicio + porPagina);

  const cambiarPorPagina = (valor: number) => {
    setPorPagina(valor);
    setPaginaActual(1);
  };

  const columnasAMostrar = TODAS_LAS_COLUMNAS.filter((col) => columnasVisibles.includes(col.campo));

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
          const sugerido = sessionStorage.getItem('nombreUsuario') ?? '';
          const nombreEntrega = window.prompt('¿Quién entrega el equipo?', sugerido);
          if (nombreEntrega === null) return;
          const token = sessionStorage.getItem('token');
          window.open(`http://localhost:3000/activos/${activoViendo.id}/acta?token=${token}&entrega=${encodeURIComponent(nombreEntrega)}`, '_blank');
        }}
      />
    );
  }

  return (
    <div>
      <Notificacion mensaje={notiMensaje} tipo="exito" visible={notiVisible} />
      <h2 style={{ color: '#1f1b3d' }}>Activos</h2>

      <div className="no-imprimir" style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
        <button className="btn-outline" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>

        <div ref={menuColumnasRef} style={{ position: 'relative' }}>
          <button className="btn-outline" onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)}>
            ⚙️ Columnas ({columnasVisibles.length})
          </button>
          {menuColumnasAbierto && (
            <div style={{
              position: 'absolute', top: '110%', left: 0,
              background: 'white', border: '1px solid #e3ddd0', borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '0.7rem',
              zIndex: 100, width: '240px',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1f1b3d', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Columnas visibles
              </div>
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {TODAS_LAS_COLUMNAS.map((col) => (
                  <label
                    key={col.campo}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.2rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f3')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <input
                      type="checkbox"
                      checked={columnasVisibles.includes(col.campo)}
                      onChange={() => alternarColumna(col.campo)}
                    />
                    {col.etiqueta}
                  </label>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f0eee6', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={restaurarColumnasDefecto}
                  style={{ background: 'none', border: 'none', color: '#b8842e', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                >
                  Restaurar columnas por defecto
                </button>
              </div>
            </div>
          )}
        </div>

        {seleccionados.length > 0 && (
          <button className="btn-accent" onClick={generarActaLote}>
            📄 Generar actas ({seleccionados.length})
          </button>
        )}
        <button className="btn-delete" onClick={eliminarTodos} style={{ marginLeft: 'auto' }}>
          🗑️ Eliminar todos
        </button>
      </div>

      <div className="no-imprimir" style={{ border: '1px solid #e2e0f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#fafaff' }}>
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
        <div style={{ marginTop: '0.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={soloSinResponsable}
              onChange={(e) => setSoloSinResponsable(e.target.checked)}
            />
            Mostrar solo equipos sin responsable asignado
          </label>
        </div>
      </div>

      {mostrarFormulario && (
        <form onSubmit={guardarActivo} className="no-imprimir" style={{ marginBottom: '2rem', border: '1px solid #e2e0f0', padding: '1.2rem', borderRadius: '10px', backgroundColor: '#fafaff' }}>
          <h3 style={{ color: '#1f1b3d' }}>Datos básicos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <div style={campoStyle}>
              <label style={labelStyle}>Código *</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => actualizarCampo('codigo', e.target.value)}
                required
                style={{ ...inputStyle, borderColor: codigoDuplicado ? '#c0443f' : undefined }}
              />
              {codigoDuplicado && (
                <p style={{ color: '#c0443f', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>
                  ⚠️ Ya existe un activo con este código
                </p>
              )}
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
              <SelectorBusqueda
                opciones={empleados.map((emp) => ({ id: emp.id, etiqueta: emp.nombre }))}
                valorId={form.responsableId}
                onSeleccionar={(id) => actualizarCampo('responsableId', id)}
                placeholder="Escribe para buscar..."
                permitirVacio
                textoVacio="-- Sin asignar --"
              />
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
            <div style={campoStyle}>
              <label style={labelStyle}>Costo de adquisición (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costo}
                onChange={(e) => actualizarCampo('costo', e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                style={inputStyle}
                placeholder="0.00"
              />
            </div>
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

      <div className="no-imprimir" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
          Mostrando {activosPagina.length ? inicio + 1 : 0}–{inicio + activosPagina.length} de {activosFiltrados.length} activos
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={alternarDensidad}
            className="btn-outline"
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
            title={vistaCompacta ? 'Cambiar a vista cómoda' : 'Cambiar a vista compacta'}
          >
            {vistaCompacta ? '☰ Compacta' : '☰ Cómoda'}
          </button>
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

      <table className={vistaCompacta ? 'tabla-compacta' : ''} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr>
            <th className="no-imprimir" style={{ padding: '0.5rem', width: '32px' }}></th>
            {columnasAMostrar.map((col) => (
              <th key={col.campo} style={{ textAlign: 'left', padding: '0.5rem' }}>
                {col.etiqueta}
              </th>
            ))}
            <th className="no-imprimir" style={{ padding: '0.5rem', width: '140px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activosPagina.map((activo) => (
            <tr key={activo.id}>
              <td className="no-imprimir" style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                <input type="checkbox" checked={seleccionados.includes(activo.id)} onChange={() => alternarSeleccion(activo.id)} />
              </td>
              {columnasAMostrar.map((col) => (
                <td key={col.campo} style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                  {col.campo === 'estado' ? <BadgeEstado estado={activo.estado} /> : obtenerValorColumna(activo, col.campo)}
                </td>
              ))}
              <td className="no-imprimir" style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                  <button className="btn-outline" onClick={() => setActivoViendo(activo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Ver detalle completo">
                    👁️
                  </button>
                  <button className="btn-edit" onClick={() => empezarEdicion(activo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Editar este activo">
                    ✏️
                  </button>
                  <button className="btn-outline" onClick={() => duplicarActivo(activo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Duplicar (crear copia con los mismos datos)">
                    📋
                  </button>
                  <button className="btn-delete" onClick={() => pedirEliminar(activo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Eliminar este activo">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="no-imprimir" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
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

      <ModalConfirmar
        abierto={!!activoAEliminar}
        titulo="Mover a la papelera"
        mensaje={`¿Seguro que quieres mover "${activoAEliminar?.codigo}" a la papelera? Podrás restaurarlo después si fue un error.`}
        textoConfirmar="Mover a papelera"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setActivoAEliminar(null)}
      />
    </div>
  );
}

export default Activos;