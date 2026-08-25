import { useState, useEffect } from 'react';
import axios from 'axios';

interface Oficina {
  id: number;
  nombre: string;
  direccion: string | null;
}

function Oficinas() {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarOficinas = () => {
    axios.get('http://localhost:3000/oficinas')
      .then((res) => {
        setOficinas(res.data);
      })
      .catch((error) => {
        console.error('Error al cargar oficinas:', error);
      });
  };

  useEffect(() => {
    cargarOficinas();
  }, []);

  const guardarOficina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoId) {
      await axios.put(`http://localhost:3000/oficinas/${editandoId}`, { nombre, direccion });
    } else {
      await axios.post('http://localhost:3000/oficinas', { nombre, direccion });
    }
    setNombre('');
    setDireccion('');
    setEditandoId(null);
    cargarOficinas();
  };

  const empezarEdicion = (oficina: Oficina) => {
    setEditandoId(oficina.id);
    setNombre(oficina.nombre);
    setDireccion(oficina.direccion ?? '');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setDireccion('');
  };

  const eliminarOficina = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar esta oficina?');
    if (!confirmar) return;
    await axios.delete(`http://localhost:3000/oficinas/${id}`);
    cargarOficinas();
  };

  return (
    <div>
      <h2>Oficinas</h2>

      <form onSubmit={guardarOficina} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Nombre de la oficina"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}>
          {editandoId ? 'Guardar cambios' : 'Agregar oficina'}
        </button>
        {editandoId && (
          <button type="button" onClick={cancelarEdicion} style={{ padding: '0.5rem 1rem' }}>
            Cancelar
          </button>
        )}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Nombre</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Dirección</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {oficinas.map((oficina) => (
            <tr key={oficina.id}>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{oficina.nombre}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{oficina.direccion}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <button onClick={() => empezarEdicion(oficina)} style={{ marginRight: '0.5rem' }}>
                  Editar
                </button>
                <button onClick={() => eliminarOficina(oficina.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Oficinas;