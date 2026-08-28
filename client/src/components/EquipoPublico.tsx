import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';

interface DatosEquipo {
  codigo: string;
  tipo: string;
  marca: string | null;
  claseEquipo: string | null;
  numeroSerie: string | null;
  estado: string;
  oficina: string;
  responsable: string;
}

function BadgeEstado({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; color: string; texto: string }> = {
    activo: { bg: '#e7f6ee', color: '#1e8e5a', texto: 'Activo' },
    mantenimiento: { bg: '#fff4e0', color: '#b8790a', texto: 'En mantenimiento' },
    baja: { bg: '#fdeaea', color: '#dc3545', texto: 'Dado de baja' },
  };
  const c = config[estado] ?? { bg: '#eee', color: '#555', texto: estado };
  return (
    <span style={{ backgroundColor: c.bg, color: c.color, padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
      {c.texto}
    </span>
  );
}

function EquipoPublico() {
  const [datos, setDatos] = useState<DatosEquipo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const codigo = window.location.pathname.split('/equipo/')[1];
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/publico/equipo/${codigo}`)
      .then((res) => setDatos(res.data))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f4ec' }}>
        <p style={{ color: '#888' }}>Equipo no encontrado.</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f4ec' }}>
        <p style={{ color: '#888' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <img src={logo} alt="Gañansol" style={{ height: '48px', borderRadius: '6px' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ color: '#1f1b3d', fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>{datos.codigo}</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '0.3rem 0 0.8rem' }}>{datos.tipo}</p>
          <BadgeEstado estado={datos.estado} />
        </div>

        <div style={{ borderTop: '1px solid #f0eee6', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f5f4ee' }}>
            <div style={{ width: '120px', color: '#888', fontSize: '0.82rem' }}>Marca</div>
            <div style={{ flex: 1, fontSize: '0.88rem' }}>{datos.marca || '—'}</div>
          </div>
          <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f5f4ee' }}>
            <div style={{ width: '120px', color: '#888', fontSize: '0.82rem' }}>Modelo</div>
            <div style={{ flex: 1, fontSize: '0.88rem' }}>{datos.claseEquipo || '—'}</div>
          </div>
          <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f5f4ee' }}>
            <div style={{ width: '120px', color: '#888', fontSize: '0.82rem' }}>N° de serie</div>
            <div style={{ flex: 1, fontSize: '0.88rem' }}>{datos.numeroSerie || '—'}</div>
          </div>
          <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f5f4ee' }}>
            <div style={{ width: '120px', color: '#888', fontSize: '0.82rem' }}>Oficina</div>
            <div style={{ flex: 1, fontSize: '0.88rem' }}>{datos.oficina || '—'}</div>
          </div>
          <div style={{ display: 'flex', padding: '0.5rem 0' }}>
            <div style={{ width: '120px', color: '#888', fontSize: '0.82rem' }}>Responsable</div>
            <div style={{ flex: 1, fontSize: '0.88rem' }}>{datos.responsable}</div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.72rem', marginTop: '1.5rem' }}>
          Inventario TI · Cooperativa Gañansol
        </p>
      </div>
    </div>
  );
}

export default EquipoPublico;