import { useState, useEffect } from 'react';
import Oficinas from './components/Oficinas';
import Empleados from './components/Empleados';
import Activos from './components/Activos';
import Login from './components/Login';
import logo from './assets/logo.png';

function App() {
  const [vista, setVista] = useState<'oficinas' | 'empleados' | 'activos'>('activos');
  const [token, setToken] = useState<string | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState<string>('');

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    if (tokenGuardado) {
      setToken(tokenGuardado);
      setNombreUsuario(nombreGuardado ?? '');
    }
  }, []);

  const manejarLogin = (nuevoToken: string, nombre: string) => {
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('nombreUsuario', nombre);
    setToken(nuevoToken);
    setNombreUsuario(nombre);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    setToken(null);
    setNombreUsuario('');
  };

  if (!token) {
    return <Login onLogin={manejarLogin} />;
  }

  const tabStyle = (activa: boolean) => ({
    padding: '0.6rem 1.3rem',
    marginRight: '0.5rem',
    borderRadius: '8px',
    backgroundColor: activa ? '#2c2560' : 'transparent',
    color: activa ? 'white' : '#444',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        background: 'linear-gradient(90deg, #2c2560 0%, #3a2f7a 100%)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <img src={logo} alt="Gañansol" style={{ height: '48px', borderRadius: '6px' }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>Inventario TI</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#d4a24c', fontWeight: 600, letterSpacing: '0.5px' }}>
            COOPERATIVA GAÑANSOL
          </p>
        </div>
        <span style={{ color: 'white', fontSize: '0.85rem' }}>👤 {nombreUsuario}</span>
        <button onClick={cerrarSesion} className="btn-outline" style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}>
          Cerrar sesión
        </button>
      </header>

      <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '1.5rem 2rem' }}>
        <nav style={{ marginBottom: '1.5rem', display: 'flex' }}>
          <button style={tabStyle(vista === 'oficinas')} onClick={() => setVista('oficinas')}>
            Oficinas
          </button>
          <button style={tabStyle(vista === 'empleados')} onClick={() => setVista('empleados')}>
            Empleados
          </button>
          <button style={tabStyle(vista === 'activos')} onClick={() => setVista('activos')}>
            Activos
          </button>
        </nav>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          {vista === 'oficinas' && <Oficinas />}
          {vista === 'empleados' && <Empleados />}
          {vista === 'activos' && <Activos />}
        </div>
      </div>
    </div>
  );
}

export default App;