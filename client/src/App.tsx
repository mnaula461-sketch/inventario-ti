import { useState } from 'react';
import './App.css';
import Oficinas from './components/Oficinas';
import Empleados from './components/Empleados';
import Activos from './components/Activos';

function App() {
  const [vista, setVista] = useState<'oficinas' | 'empleados' | 'activos'>('oficinas');

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Inventario TI</h1>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setVista('oficinas')}
          style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', fontWeight: vista === 'oficinas' ? 'bold' : 'normal' }}
        >
          Oficinas
        </button>
        <button
          onClick={() => setVista('empleados')}
          style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', fontWeight: vista === 'empleados' ? 'bold' : 'normal' }}
        >
          Empleados
        </button>
        <button
          onClick={() => setVista('activos')}
          style={{ padding: '0.5rem 1rem', fontWeight: vista === 'activos' ? 'bold' : 'normal' }}
        >
          Activos
        </button>
      </div>

      {vista === 'oficinas' && <Oficinas />}
      {vista === 'empleados' && <Empleados />}
      {vista === 'activos' && <Activos />}
    </div>
  );
}

export default App;