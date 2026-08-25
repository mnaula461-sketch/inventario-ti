import { useState } from 'react';
import './App.css';
import Oficinas from './components/Oficinas';
import Empleados from './components/Empleados';

function App() {
  const [vista, setVista] = useState<'oficinas' | 'empleados'>('oficinas');

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
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
          style={{ padding: '0.5rem 1rem', fontWeight: vista === 'empleados' ? 'bold' : 'normal' }}
        >
          Empleados
        </button>
      </div>

      {vista === 'oficinas' ? <Oficinas /> : <Empleados />}
    </div>
  );
}

export default App;