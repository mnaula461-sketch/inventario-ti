import { useState } from 'react';
import api from '../api';

interface PerfilProps {
  nombreUsuario: string;
}

function Perfil({ nombreUsuario }: PerfilProps) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (passwordNueva !== passwordConfirmar) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwordNueva.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      await api.put('/auth/cambiar-password', { passwordActual, passwordNueva });
      setMensaje('Contraseña actualizada correctamente');
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Error al cambiar la contraseña');
    }
  };

  const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem' };
  const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };

  return (
    <div>
      <h2 style={{ color: '#2c2560' }}>Mi perfil</h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '420px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ marginBottom: '1.2rem', color: '#444' }}>
          👤 <strong>{nombreUsuario}</strong>
        </p>

        <h3 style={{ color: '#2c2560', fontSize: '1rem', marginBottom: '1rem' }}>Cambiar contraseña</h3>

        <form onSubmit={cambiarPassword}>
          <div style={{ marginBottom: '0.8rem' }}>
            <label style={labelStyle}>Contraseña actual</label>
            <input type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.8rem' }}>
            <label style={labelStyle}>Nueva contraseña</label>
            <input type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <input type="password" value={passwordConfirmar} onChange={(e) => setPasswordConfirmar(e.target.value)} required style={inputStyle} />
          </div>

          {error && <p style={{ color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
          {mensaje && <p style={{ color: '#1e8e5a', fontSize: '0.85rem', marginBottom: '1rem' }}>{mensaje}</p>}

          <button type="submit" className="btn-primary">Actualizar contraseña</button>
        </form>
      </div>
    </div>
  );
}

export default Perfil;