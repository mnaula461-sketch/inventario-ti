import { useState, useEffect } from 'react';
import api from '../api';

interface Oficina {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
  correo: string | null;
  oficina: Oficina;
}

interface Activo {
  id: number;
  codigo: string;
  tipo: string;
  marca: string | null;
  estado: string;
  oficina: Oficina;
}

interface EmpleadoDetalleProps {
  empleado: Empleado;
  onVolver: () => void;
  onEditar: () => void;
}

function BadgeEstado({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; color: string; texto: string }> = {
    activo: { bg: '#e7f6ee', color: '#1e8e5a', texto: 'Activo' },
    mantenimiento: { bg: '#fff4e0', color: '#b8790a', texto: 'Mantenimiento' },
    baja: { bg: '#fdeaea', color: '#dc3545', texto: 'Dado de baja' },
  };
  const c = config[estado] ?? { bg: '#eee', color: '#555', texto: estado };
  return (
    <span style={{ backgroundColor: c.bg, color: c.color, padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
      {c.texto}
    </span>
  );
}

function EmpleadoDetalle({ empleado, onVolver, onEditar }: EmpleadoDetalleProps) {
  const [activos, setActivos] = useState<Activo[]>([]);

  useEffect(() => {
    api.get(`/empleados/${empleado.id}/activos`)
      .then((res) => setActivos(res.data))
      .catch((error) => console.error('Error al cargar activos del empleado:', error));
  }, [empleado.id]);

  return (
    <div>
      <button onClick={onVolver} className="btn-outline" style={{ marginBottom: '1.2rem' }}>
        ← Volver al listado
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#1f1b3d', fontSize: '1.5rem', marginBottom: '0.3rem' }}>{empleado.nombre}</h2>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>{empleado.cargo ?? 'Sin cargo especificado'}</p>
        </div>
        <button onClick={onEditar} className="btn-edit">✏️ Editar</button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '0.8rem' }}>Información</h3>
        <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f5' }}>
          <div style={{ width: '160px', color: '#888', fontSize: '0.85rem' }}>Correo</div>
          <div style={{ flex: 1, fontSize: '0.9rem' }}>{empleado.correo || '—'}</div>
        </div>
        <div style={{ display: 'flex', padding: '0.5rem 0' }}>
          <div style={{ width: '160px', color: '#888', fontSize: '0.85rem' }}>Oficina</div>
          <div style={{ flex: 1, fontSize: '0.9rem' }}>{empleado.oficina?.nombre || '—'}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '0.8rem' }}>
          Equipos asignados ({activos.length})
        </h3>
        {activos.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.85rem' }}>No tiene equipos asignados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.4rem', color: '#888', fontSize: '0.78rem', fontWeight: 600 }}>Código</th>
                <th style={{ textAlign: 'left', padding: '0.4rem', color: '#888', fontSize: '0.78rem', fontWeight: 600 }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '0.4rem', color: '#888', fontSize: '0.78rem', fontWeight: 600 }}>Marca</th>
                <th style={{ textAlign: 'left', padding: '0.4rem', color: '#888', fontSize: '0.78rem', fontWeight: 600 }}>Oficina</th>
                <th style={{ textAlign: 'left', padding: '0.4rem', color: '#888', fontSize: '0.78rem', fontWeight: 600 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {activos.map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #f5f5f5' }}>{a.codigo}</td>
                  <td style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #f5f5f5' }}>{a.tipo}</td>
                  <td style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #f5f5f5' }}>{a.marca}</td>
                  <td style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #f5f5f5' }}>{a.oficina?.nombre}</td>
                  <td style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #f5f5f5' }}><BadgeEstado estado={a.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EmpleadoDetalle;