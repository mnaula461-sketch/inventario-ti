import { useState, useEffect } from 'react';
import axios from 'axios';

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
  oficinaId: number;
  responsableId: number | null;
  oficina: Oficina;
  responsable: Empleado | null;
}

const camposIniciales = {
  codigo: '', tipo: '', ip: '', macAddress: '', puertoRed: '', departamento: '',
  marca: '', claseEquipo: '', numeroSerie: '', monitor: '', serieMonitor: '',
  codigoContable: '', parlantes: '', placaMadre: '', procesador: '', ram: '',
  disco: '', estadoRaton: '', estadoTeclado: '', estadoDisco: '', sistemaOperativo: '',
  mantenimiento: '', actualizable: '', anydesk: '', upgrade: '', recomendacion: '',
  saleA: '', entraA: '', estado: 'activo', antivirus: '', criterio: '',
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

function Activos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [form, setForm] = useState(camposIniciales);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const cargarActivos = () => {
    axios.get('http://localhost:3000/activos')
      .then((res) => setActivos(res.data))
      .catch((error) => console.error('Error al cargar activos:', error));
  };

  const cargarOficinas = () => {
    axios.get('http://localhost:3000/oficinas')
      .then((res) => setOficinas(res.data))
      .catch((error) => console.error('Error al cargar oficinas:', error));
  };

  const cargarEmpleados = () => {
    axios.get('http://localhost:3000/empleados')
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
      await axios.put(`http://localhost:3000/activos/${editandoId}`, data);
    } else {
      await axios.post('http://localhost:3000/activos', data);
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
      oficinaId: String(activo.oficinaId),
      responsableId: activo.responsableId ? String(activo.responsableId) : '',
    });
  };

  const eliminarActivo = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este activo?');
    if (!confirmar) return;
    await axios.delete(`http://localhost:3000/activos/${id}`);
    cargarActivos();
  };

  return (
    <div>
      <h2>Activos</h2>

      {!mostrarFormulario && (
        <button onClick={() => setMostrarFormulario(true)} style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem' }}>
          + Agregar activo
        </button>
      )}

      {mostrarFormulario && (
        <form onSubmit={guardarActivo} style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
          <h3>Datos básicos</h3>
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

          <h3>Red</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <Campo label="IP" valor={form.ip} onChange={(v) => actualizarCampo('ip', v)} />
            <Campo label="MAC Address" valor={form.macAddress} onChange={(v) => actualizarCampo('macAddress', v)} />
            <Campo label="Puerto de red" valor={form.puertoRed} onChange={(v) => actualizarCampo('puertoRed', v)} />
            <Campo label="AnyDesk" valor={form.anydesk} onChange={(v) => actualizarCampo('anydesk', v)} />
          </div>

          <h3>Hardware</h3>
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

          <h3>Estado y mantenimiento</h3>
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

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}>
              {editandoId ? 'Guardar cambios' : 'Agregar activo'}
            </button>
            <button type="button" onClick={limpiarFormulario} style={{ padding: '0.5rem 1rem' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Código</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Tipo</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Marca</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Oficina</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Responsable</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Estado</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activos.map((activo) => (
            <tr key={activo.id}>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{activo.codigo}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{activo.tipo}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{activo.marca}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{activo.oficina?.nombre}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{activo.responsable?.nombre ?? '—'}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{activo.estado}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <button onClick={() => empezarEdicion(activo)} style={{ marginRight: '0.5rem' }}>Editar</button>
                <button onClick={() => eliminarActivo(activo.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Activos;