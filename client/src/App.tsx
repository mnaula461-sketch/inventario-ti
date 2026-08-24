import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Oficina {
  id: number;
  nombre: string;
  direccion: string | null;
}

function App() {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');

  const cargarOficinas = () => {
    axios.get('http://localhost:3000/oficinas').then((res) => {
      setOficinas(res.data);
    });
  };

  useEffect(() => {
    cargarOficinas();
  }, []);

  const crearOficina = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/oficinas', { nombre, direccion });
    setNombre('');
    setDireccion('');
    cargarOficinas();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Inventario TI - Oficinas</h1>

      <form onSubmit={crearOficina} style={{ marginBottom: '2rem' }}>
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
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Agregar oficina
        </button>
      </form>

      <ul>
        {oficinas.map((oficina) => (
          <li key={oficina.id}>
            <strong>{oficina.nombre}</strong> — {oficina.direccion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;