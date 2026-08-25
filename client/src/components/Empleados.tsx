import { useState, useEffect } from 'react';
import axios from 'axios';

interface Oficina {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
  oficinaId: number;
  oficina: Oficina;
}

function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [oficinaId, setOficinaId] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarEmpleados = () => {
    axios.get('http://localhost:3000/empleados')
      .then((res) => setEmpleados(res.data))
      .catch((error) => console.error('Error al cargar empleados:', error));
  };

  const cargarOficinas = () => {
    axios.get('http://localhost:3000/oficinas')
      .then((res) => setOficinas(res.data))
      .catch((error) => console.error('Error al cargar oficinas:', error));
  };

  useEffect(() => {
    cargarEmpleados();
    cargarOficinas();
  }, []);

  const guardarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { nombre, cargo, oficinaId: Number(oficinaId) };
    if (editandoId) {
      await axios.put(`http://localhost:3000/empleados/${editandoId}`, data);
    } else {
      await axios.post('http://localhost:3000/empleados', data);
    }
    setNombre('');
    setCargo('');
    setOficinaId('');
    setEditandoId(null);
    cargarEmpleados();
  };

  const empezarEdicion = (empleado: Empleado) => {
    setEditandoId(empleado.id);
    setNombre(empleado.nombre);
    setCargo(empleado.cargo ?? '');
    setOficinaId(String(empleado.oficinaId));
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setCargo('');
    setOficinaId('');
  };

  const eliminarEmpleado = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este empleado?');
    if (!confirmar) return;
    await axios.delete(`http://localhost:3000/empleados/${id}`);
    cargarEmpleados();
  };

  return (
    <div>
      <h2>Empleados</h2>

      <form onSubmit={guardarEmpleado} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Nombre del empleado"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <select
            value={oficinaId}
            onChange={(e) => setOficinaId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">-- Selecciona una oficina --</option>
            {oficinas.map((oficina) => (
              <option key={oficina.id} value={oficina.id}>
                {oficina.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}>
          {editandoId ? 'Guardar cambios' : 'Agregar empleado'}
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
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Cargo</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Oficina</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado) => (
            <tr key={empleado.id}>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{empleado.nombre}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{empleado.cargo}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{empleado.oficina?.nombre}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <button onClick={() => empezarEdicion(empleado)} style={{ marginRight: '0.5rem' }}>
                  Editar
                </button>
                <button onClick={() => eliminarEmpleado(empleado.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Empleados;