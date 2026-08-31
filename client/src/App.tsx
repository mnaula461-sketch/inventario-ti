import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Oficinas from './components/Oficinas';
import Empleados from './components/Empleados';
import Activos from './components/Activos';
import Reportes from './components/Reportes';
import Perfil from './components/Perfil';
import BusquedaGlobal from './components/BusquedaGlobal';
import Papelera from './components/Papelera';
import Login from './components/Login';
import EquipoPublico from './components/EquipoPublico';
import Notificacion from './components/Notificacion';
import ModalConfirmar from './components/ModalConfirmar';
import logo from './assets/logo.png';

type Vista = 'dashboard' | 'oficinas' | 'empleados' | 'activos' | 'reportes' | 'perfil' | 'papelera';

function App() {
  const [vista, setVista] = useState<Vista>('dashboard');
  const [token, setToken] = useState<string | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [rol, setRol] = useState<string>('tecnico');
  const [errorConexion, setErrorConexion] = useState(false);
  const [filtroOficinaInicial, setFiltroOficinaInicial] = useState<number | null>(null);
  const [equipoIdInicial, setEquipoIdInicial] = useState<number | null>(null);

    const [errorGlobal, setErrorGlobal] = useState('');
  const [errorGlobalVisible, setErrorGlobalVisible] = useState(false);

  useEffect(() => {
    function manejarErrorApi(e: Event) {
      const mensaje = (e as CustomEvent).detail as string;
      setErrorGlobal(mensaje);
      setErrorGlobalVisible(true);
      setTimeout(() => setErrorGlobalVisible(false), 4000);
    }
    window.addEventListener('api-error', manejarErrorApi);
    return () => window.removeEventListener('api-error', manejarErrorApi);
  }, []);

  useEffect(() => {
    const tokenGuardado = sessionStorage.getItem('token');
    const nombreGuardado = sessionStorage.getItem('nombreUsuario');
    const rolGuardado = sessionStorage.getItem('rol');
    if (tokenGuardado) {
      setToken(tokenGuardado);
      setNombreUsuario(nombreGuardado ?? '');
      setRol(rolGuardado ?? 'tecnico');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(import.meta.env.VITE_API_URL || 'http://localhost:3000')
      .then(() => setErrorConexion(false))
      .catch(() => setErrorConexion(true));
  }, [token]);

  const manejarLogin = (nuevoToken: string, nombre: string, nuevoRol: string) => {
    sessionStorage.setItem('token', nuevoToken);
    sessionStorage.setItem('nombreUsuario', nombre);
    sessionStorage.setItem('rol', nuevoRol);
    setToken(nuevoToken);
    setNombreUsuario(nombre);
    setRol(nuevoRol);
    setVista('dashboard');
  };

  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nombreUsuario');
    sessionStorage.removeItem('rol');
    setToken(null);
    setNombreUsuario('');
    setRol('tecnico');
    setConfirmandoSalida(false);
  };

  const irAActivosDeOficina = (oficinaId: number) => {
    setFiltroOficinaInicial(oficinaId);
    setVista('activos');
  };

    const irAEquipo = (equipoId: number) => {
    setEquipoIdInicial(equipoId);
    setVista('activos');
  };

  // Ruta pública: /equipo/CODIGO - no requiere login
  if (window.location.pathname.startsWith('/equipo/')) {
    return <EquipoPublico />;
  }

  if (!token) {
    return <Login onLogin={manejarLogin} />;
  }

  const esAdmin = rol === 'admin';

  const tabStyle = (activa: boolean) => ({
    padding: '0.6rem 1.3rem',
    marginRight: '0.5rem',
    borderRadius: '8px',
    backgroundColor: activa ? '#2c2560' : 'transparent',
    color: activa ? 'white' : '#444',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <Notificacion mensaje={errorGlobal} tipo="error" visible={errorGlobalVisible} />
      {errorConexion && (
        <div style={{ background: '#c0443f', color: 'white', padding: '0.7rem 1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          ⚠️ No se puede conectar con el servidor. Verifica que Docker y el backend estén corriendo, luego recarga la página.
        </div>
      )}
      <header style={{
        background: 'linear-gradient(90deg, #2c2560 0%, #3a2f7a 100%)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <img
          src={logo}
          alt="Gañansol"
          style={{ height: '48px', borderRadius: '6px', cursor: 'pointer' }}
          onClick={() => setVista('dashboard')}
        />
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setVista('dashboard')}>
          <h1 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>Inventario TI</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#d4a24c', fontWeight: 600, letterSpacing: '0.5px' }}>
            COOPERATIVA GAÑANSOL
          </p>
        </div>
        <BusquedaGlobal onIrA={setVista} />
        <span style={{ color: 'white', fontSize: '0.85rem' }}>
          👤 {nombreUsuario} {esAdmin && <span style={{ opacity: 0.7 }}>(Admin)</span>}
        </span>
        <button onClick={() => setConfirmandoSalida(true)} className="btn-outline" style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}>
          Cerrar sesión
        </button>
      </header>

      <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '1.5rem 2rem' }}>
        <nav style={{ marginBottom: '1.5rem', display: 'flex' }}>
          <button style={tabStyle(vista === 'dashboard')} onClick={() => setVista('dashboard')}>
            🏠 Inicio
          </button>
          <button style={tabStyle(vista === 'oficinas')} onClick={() => setVista('oficinas')}>
            Oficinas
          </button>
          <button style={tabStyle(vista === 'empleados')} onClick={() => setVista('empleados')}>
            Empleados
          </button>
          <button style={tabStyle(vista === 'activos')} onClick={() => setVista('activos')}>
            Activos
          </button>
          <button style={tabStyle(vista === 'reportes')} onClick={() => setVista('reportes')}>
            Reportes
          </button>
          <button style={tabStyle(vista === 'perfil')} onClick={() => setVista('perfil')}>
            Mi perfil
          </button>
          <button style={tabStyle(vista === 'papelera')} onClick={() => setVista('papelera')}>
            🗑️ Papelera
          </button>
        </nav>

        <div style={{ backgroundColor: vista === 'dashboard' ? 'transparent' : 'white', borderRadius: '12px', padding: vista === 'dashboard' ? '0' : '1.5rem', boxShadow: vista === 'dashboard' ? 'none' : '0 1px 4px rgba(0,0,0,0.08)' }}>
          {vista === 'dashboard' && <Dashboard nombreUsuario={nombreUsuario} onNavegar={setVista} onVerEquipo={irAEquipo} />}
          {vista === 'oficinas' && <Oficinas onVerEnActivos={irAActivosDeOficina} />}
          {vista === 'empleados' && <Empleados />}
          {vista === 'activos' && <Activos esAdmin={esAdmin} filtroOficinaInicial={filtroOficinaInicial} onFiltroOficinaAplicado={() => setFiltroOficinaInicial(null)} equipoIdInicial={equipoIdInicial} onEquipoInicialAplicado={() => setEquipoIdInicial(null)} />}
          {vista === 'reportes' && <Reportes />}
          {vista === 'perfil' && <Perfil nombreUsuario={nombreUsuario} esAdmin={esAdmin} />}
          {vista === 'papelera' && <Papelera esAdmin={esAdmin} />}
        </div>
      </div>

      <ModalConfirmar
        abierto={confirmandoSalida}
        titulo="Cerrar sesión"
        mensaje="¿Seguro que quieres cerrar sesión?"
        textoConfirmar="Cerrar sesión"
        onConfirmar={cerrarSesion}
        onCancelar={() => setConfirmandoSalida(false)}
      />
    </div>
  );
}

export default App;