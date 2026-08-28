import { useState, useEffect, useRef } from 'react';
import api from '../api';
import EmpleadoDetalle from './EmpleadoDetalle';
import ModalConfirmar from './ModalConfirmar';

interface Oficina {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
  correo: string | null;
  oficinaId: number;
  oficina: Oficina;
}

const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem' };
const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };

const TODAS_LAS_COLUMNAS_EMP = [
  { campo: 'nombre', etiqueta: 'Nombre' },
  { campo: 'cargo', etiqueta: 'Cargo' },
  { campo: 'correo', etiqueta: 'Correo' },
  { campo: 'oficina', etiqueta: 'Oficina' },
];
const COLUMNAS_EMP_DEFECTO = ['nombre', 'cargo', 'correo', 'oficina'];

function obtenerValorColumnaEmp(emp: Empleado, campo: string): string {
  if (campo === 'oficina') return emp.oficina?.nombre ?? '';
  return String((emp as any)[campo] ?? '');
}

function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [correo, setCorreo] = useState('');
  const [oficinaId, setOficinaId] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [empleadoViendo, setEmpleadoViendo] = useState<Empleado | null>(null);

  const [columnasVisibles, setColumnasVisibles] = useState<string[]>(() => {
    const guardadas = localStorage.getItem('columnasEmpleados');
    return guardadas ? JSON.parse(guardadas) : COLUMNAS_EMP_DEFECTO;
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
      localStorage.setItem('columnasEmpleados', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const cargarEmpleados = () => {
    api.get('/empleados')
      .then((res) => setEmpleados(res.data))
      .catch((error) => console.error('Error al cargar empleados:', error));
  };

  const cargarOficinas = () => {
    api.get('/oficinas')
      .then((res) => setOficinas(res.data))
      .catch((error) => console.error('Error al cargar oficinas:', error));
  };

  useEffect(() => {
    cargarEmpleados();
    cargarOficinas();
  }, []);

  const guardarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { nombre, cargo, correo, oficinaId: Number(oficinaId) };
    if (editandoId) {
      await api.put(`/empleados/${editandoId}`, data);
    } else {
      await api.post('/empleados', data);
    }
    setNombre('');
    setCargo('');
    setCorreo('');
    setOficinaId('');
    setEditandoId(null);
    setMostrarFormulario(false);
    cargarEmpleados();
  };

  const empezarEdicion = (empleado: Empleado) => {
    setEditandoId(empleado.id);
    setNombre(empleado.nombre);
    setCargo(empleado.cargo ?? '');
    setCorreo(empleado.correo ?? '');
    setOficinaId(String(empleado.oficinaId));
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setCargo('');
    setCorreo('');
    setOficinaId('');
    setMostrarFormulario(false);
  };

  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<Empleado | null>(null);

  const confirmarEliminarEmpleado = async () => {
    if (!empleadoAEliminar) return;
    try {
      await api.delete(`/empleados/${empleadoAEliminar.id}`);
      setEmpleadoAEliminar(null);
      cargarEmpleados();
    } catch (error: any) {
      setEmpleadoAEliminar(null);
      alert(error.response?.data?.error ?? 'Error al eliminar el empleado');
    }
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const texto = busqueda.toLowerCase();
    return (
      emp.nombre.toLowerCase().includes(texto) ||
      (emp.cargo ?? '').toLowerCase().includes(texto) ||
      emp.oficina?.nombre.toLowerCase().includes(texto)
    );
  });

  if (empleadoViendo) {
    return (
      <EmpleadoDetalle
        empleado={empleadoViendo}
        onVolver={() => setEmpleadoViendo(null)}
        onEditar={() => {
          empezarEdicion(empleadoViendo);
          setEmpleadoViendo(null);
        }}
      />
    );
  }

  return (
    <div>
      <h2 style={{ color: '#1f1b3d' }}>Empleados</h2>

      <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.6rem' }}>
        {!mostrarFormulario && (
          <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
            + Agregar empleado
          </button>
        )}
        <div ref={menuColumnasRef} style={{ position: 'relative' }}>
          <button className="btn-outline" onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)}>
            ⚙️ Columnas ({columnasVisibles.length})
          </button>
          {menuColumnasAbierto && (
            <div style={{
              position: 'absolute', top: '110%', left: 0,
              background: 'white', border: '1px solid #e3ddd0', borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '0.7rem',
              zIndex: 100, width: '200px',
            }}>
              {TODAS_LAS_COLUMNAS_EMP.map((col) => (
                <label key={col.campo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.2rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={columnasVisibles.includes(col.campo)}
                    onChange={() => alternarColumna(col.campo)}
                  />
                  {col.etiqueta}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {mostrarFormulario && (
        <form onSubmit={guardarEmpleado} style={{ marginBottom: '1.5rem', border: '1px solid #e2e0f0', padding: '1.2rem', borderRadius: '10px', backgroundColor: '#fafaff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nombre del empleado</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                style={inputStyle}
              />
            </div>
              <div>
              <label style={labelStyle}>Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Oficina</label>
              <select
                value={oficinaId}
                onChange={(e) => setOficinaId(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">-- Selecciona una oficina --</option>
                {oficinas.map((oficina) => (
                  <option key={oficina.id} value={oficina.id}>
                    {oficina.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginRight: '0.5rem' }}>
            {editandoId ? 'Guardar cambios' : 'Agregar empleado'}
          </button>
          <button type="button" className="btn-outline" onClick={cancelarEdicion}>
            Cancelar
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Buscar por nombre, cargo u oficina..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ ...inputStyle, marginBottom: '1rem' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr>
            {TODAS_LAS_COLUMNAS_EMP.filter((col) => columnasVisibles.includes(col.campo)).map((col) => (
              <th key={col.campo} style={{ textAlign: 'left', padding: '0.5rem' }}>{col.etiqueta}</th>
            ))}
            <th style={{ padding: '0.5rem', width: '140px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map((empleado) => (
            <tr key={empleado.id}>
              {TODAS_LAS_COLUMNAS_EMP.filter((col) => columnasVisibles.includes(col.campo)).map((col) => (
                <td key={col.campo} style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                  {obtenerValorColumnaEmp(empleado, col.campo)}
                </td>
              ))}
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                  <button className="btn-outline" onClick={() => setEmpleadoViendo(empleado)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Ver detalle">
                    👁️
                  </button>
                  <button className="btn-edit" onClick={() => empezarEdicion(empleado)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Editar">
                    ✏️
                  </button>
                  <button className="btn-delete" onClick={() => setEmpleadoAEliminar(empleado)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Eliminar">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalConfirmar
        abierto={!!empleadoAEliminar}
        titulo="Eliminar empleado"
        mensaje={`¿Seguro que quieres eliminar a "${empleadoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminarEmpleado}
        onCancelar={() => setEmpleadoAEliminar(null)}
      />
    </div>
  );
}

export default Empleados;