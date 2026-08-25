import { useState, useEffect } from 'react';
import api from '../api';

interface Oficina {
  id: number;
  nombre: string;
  direccion: string | null;
}

const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem' };
const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };

function Oficinas() {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarOficinas = () => {
    api.get('/oficinas')
      .then((res) => setOficinas(res.data))
      .catch((error) => console.error('Error al cargar oficinas:', error));
  };

  useEffect(() => {
    cargarOficinas();
  }, []);

  const guardarOficina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoId) {
      await api.put(`/oficinas/${editandoId}`, { nombre, direccion });
    } else {
      await api.post('/oficinas', { nombre, direccion });
    }
    setNombre('');
    setDireccion('');
    setEditandoId(null);
    setMostrarFormulario(false);
    cargarOficinas();
  };

  const empezarEdicion = (oficina: Oficina) => {
    setEditandoId(oficina.id);
    setNombre(oficina.nombre);
    setDireccion(oficina.direccion ?? '');
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setDireccion('');
    setMostrarFormulario(false);
  };

  const eliminarOficina = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar esta oficina?');
    if (!confirmar) return;
    await api.delete(`/oficinas/${id}`);
    cargarOficinas();
  };

  const oficinasFiltradas = oficinas.filter((of) => {
    const texto = busqueda.toLowerCase();
    return of.nombre.toLowerCase().includes(texto) || (of.direccion ?? '').toLowerCase().includes(texto);
  });

  return (
    <div>
      <h2 style={{ color: '#2c2560' }}>Oficinas</h2>

      <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.6rem' }}>
        {!mostrarFormulario && (
          <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
            + Agregar oficina
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <form onSubmit={guardarOficina} style={{ marginBottom: '1.5rem', border: '1px solid #e2e0f0', padding: '1.2rem', borderRadius: '10px', backgroundColor: '#fafaff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nombre de la oficina</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginRight: '0.5rem' }}>
            {editandoId ? 'Guardar cambios' : 'Agregar oficina'}
          </button>
          <button type="button" className="btn-outline" onClick={cancelarEdicion}>
            Cancelar
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Buscar por nombre o dirección..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ ...inputStyle, marginBottom: '1rem' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Dirección</th>
            <th style={{ padding: '0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {oficinasFiltradas.map((oficina) => (
            <tr key={oficina.id}>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{oficina.nombre}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{oficina.direccion}</td>
              <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <button className="btn-edit" onClick={() => empezarEdicion(oficina)} style={{ marginRight: '0.4rem' }}>
                  ✏️ Editar
                </button>
                <button className="btn-delete" onClick={() => eliminarOficina(oficina.id)}>
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

export default Oficinas;