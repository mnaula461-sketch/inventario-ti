import { useState, useEffect } from 'react';
import api from '../api';

interface Oficina {
  id: number;
  nombre: string;
  direccion: string | null;
  color: string | null;
}

interface Activo {
  id: number;
  oficinaId: number;
  estado: string;
}

interface MapaOficinasProps {
  onVerOficina: (oficinaId: number) => void;
}

function MapaOficinas({ onVerOficina }: MapaOficinasProps) {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);

  useEffect(() => {
    api.get('/oficinas').then((res) => setOficinas(res.data)).catch(() => {});
    api.get('/activos').then((res) => setActivos(res.data)).catch(() => {});
  }, []);

  const resumenPorOficina = (oficinaId: number) => {
    const equipos = activos.filter((a) => a.oficinaId === oficinaId);
    return {
      total: equipos.length,
      activos: equipos.filter((a) => a.estado === 'activo').length,
      mantenimiento: equipos.filter((a) => a.estado === 'mantenimiento').length,
      baja: equipos.filter((a) => a.estado === 'baja').length,
    };
  };

  const maxTotal = Math.max(1, ...oficinas.map((o) => resumenPorOficina(o.id).total));

  return (
    <div>
      <h2 style={{ color: '#1f1b3d', marginBottom: '0.4rem' }}>Mapa de oficinas</h2>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Vista general del inventario por oficina. Haz clic en una tarjeta para ver sus equipos.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
        {oficinas.map((oficina) => {
          const r = resumenPorOficina(oficina.id);
          const porcentaje = Math.round((r.total / maxTotal) * 100);
          const colorOficina = oficina.color || '#1f1b3d';
          return (
            <div
              key={oficina.id}
              onClick={() => onVerOficina(oficina.id)}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '1.3rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                cursor: 'pointer',
                borderTop: `4px solid ${colorOficina}`,
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colorOficina, flexShrink: 0 }} />
                <h3 style={{ color: '#1f1b3d', fontSize: '1.05rem', margin: 0 }}>{oficina.nombre}</h3>
              </div>
              <p style={{ color: '#999', fontSize: '0.78rem', marginBottom: '1rem' }}>{oficina.direccion || 'Sin dirección registrada'}</p>

              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f1b3d', lineHeight: 1 }}>
                {r.total}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.8rem' }}>equipos registrados</div>

              <div style={{ width: '100%', height: '6px', background: '#f0eee6', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.9rem' }}>
                <div style={{ width: `${porcentaje}%`, height: '100%', background: colorOficina }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {r.activos > 0 && (
                  <span style={{ background: '#e7f6ee', color: '#1e8e5a', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
                    {r.activos} activos
                  </span>
                )}
                {r.mantenimiento > 0 && (
                  <span style={{ background: '#fff4e0', color: '#b8790a', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
                    {r.mantenimiento} en mant.
                  </span>
                )}
                {r.baja > 0 && (
                  <span style={{ background: '#fdeaea', color: '#dc3545', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
                    {r.baja} de baja
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MapaOficinas;