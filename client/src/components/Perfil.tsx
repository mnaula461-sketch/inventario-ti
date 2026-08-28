import { useState, useEffect } from 'react';
import api from '../api';

interface PerfilProps {
  nombreUsuario: string;
}

interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
}

function Perfil({ nombreUsuario }: PerfilProps) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadoIdSeleccionado, setEmpleadoIdSeleccionado] = useState('');
  const [mensajeVinculo, setMensajeVinculo] = useState('');

  useEffect(() => {
    api.get('/empleados')
      .then((res) => setEmpleados(res.data))
      .catch(() => {});
    api.get('/auth/mis-equipos')
      .then((res) => {
        if (res.data.vinculado && res.data.equipos.length >= 0) {
          // Solo para saber si ya está vinculado, buscamos el empleado actual desde otra vía si hace falta
        }
      })
      .catch(() => {});
  }, []);

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

  const vincularEmpleado = async () => {
    setMensajeVinculo('');
    try {
      await api.put('/auth/vincular-empleado', { empleadoId: empleadoIdSeleccionado || null });
      setMensajeVinculo(empleadoIdSeleccionado ? 'Vinculado correctamente. Ahora verás tus equipos en el Inicio.' : 'Vínculo eliminado.');
    } catch {
      setMensajeVinculo('Error al vincular.');
    }
  };

  const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem' };
  const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };

  return (
    <div>
      <h2 style={{ color: '#1f1b3d' }}>Mi perfil</h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '420px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '1.2rem', color: '#444' }}>
          👤 <strong>{nombreUsuario}</strong>
        </p>

        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Cambiar contraseña</h3>

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

          {error && <p style={{ color: '#c0443f', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
          {mensaje && <p style={{ color: '#2f8f6b', fontSize: '0.85rem', marginBottom: '1rem' }}>{mensaje}</p>}

          <button type="submit" className="btn-primary">Actualizar contraseña</button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', maxWidth: '420px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '0.5rem' }}>Vincular con mi ficha de empleado</h3>
        <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: '1rem' }}>
          Selecciona tu nombre en la lista de empleados para ver tus equipos asignados directamente en el Inicio.
        </p>

        <div style={{ marginBottom: '0.8rem' }}>
          <label style={labelStyle}>Mi ficha de empleado</label>
          <select value={empleadoIdSeleccionado} onChange={(e) => setEmpleadoIdSeleccionado(e.target.value)} style={inputStyle}>
            <option value="">-- Sin vincular --</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre} {emp.cargo ? `— ${emp.cargo}` : ''}</option>
            ))}
          </select>
        </div>

        {mensajeVinculo && <p style={{ color: '#2f8f6b', fontSize: '0.85rem', marginBottom: '1rem' }}>{mensajeVinculo}</p>}

        <button onClick={vincularEmpleado} className="btn-primary">Guardar vínculo</button>
      </div>
    </div>
  );
}

export default Perfil;