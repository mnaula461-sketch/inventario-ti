import { useState, useEffect } from 'react';
import api from '../api';

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

  const eliminarEmpleado = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este empleado?');
    if (!confirmar) return;
    await api.delete(`/empleados/${id}`);
    cargarEmpleados();
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const texto = busqueda.toLowerCase();
    return (
      emp.nombre.toLowerCase().includes(texto) ||
      (emp.cargo ?? '').toLowerCase().includes(texto) ||
      emp.oficina?.nombre.toLowerCase().includes(texto)
    );
  });

  return (
    <div>
      <h2 style={{ color: '#2c2560' }}>Empleados</h2>

      <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.6rem' }}>
        {!mostrarFormulario && (
          <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
            + Agregar empleado
          </button>
        )}
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
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Cargo</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Oficina</th>
            <th style={{ padding: '0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosFiltrados.map((empleado) => (
            <tr key={empleado.id}>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{empleado.nombre}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{empleado.cargo}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{empleado.oficina?.nombre}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <button className="btn-edit" onClick={() => empezarEdicion(empleado)} style={{ marginRight: '0.4rem' }}>
                  ✏️ Editar
                </button>
                <button className="btn-delete" onClick={() => eliminarEmpleado(empleado.id)}>
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Empleados;