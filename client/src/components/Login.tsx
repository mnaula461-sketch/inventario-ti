import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';

interface LoginProps {
  onLogin: (token: string, nombre: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
                const res = await axios.post('http://localhost:3000/auth/login', { correo, password });
      onLogin(res.data.token, res.data.usuario.nombre);
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2c2560 0%, #3a2f7a 100%)',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '14px',
        padding: '2.5rem',
        width: '380px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        textAlign: 'center',
      }}>
        <img src={logo} alt="Gañansol" style={{ width: '140px', marginBottom: '1.5rem' }} />
        <h2 style={{ color: '#2c2560', marginBottom: '0.3rem' }}>Inventario TI</h2>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Inicia sesión para continuar
        </p>

        <form onSubmit={manejarLogin} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.3rem' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={{ width: '100%', padding: '0.6rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.3rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.6rem' }}
            />
          </div>

          {error && (
            <p style={{ color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={cargando}
            style={{ width: '100%', padding: '0.7rem', fontSize: '1rem' }}
          >
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;