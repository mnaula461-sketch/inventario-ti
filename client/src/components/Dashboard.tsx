import { useState, useEffect } from 'react';
import api from '../api';

interface DashboardProps {
  nombreUsuario: string;
  onNavegar: (vista: 'oficinas' | 'empleados' | 'activos') => void;
}

interface MiEquipo {
  id: number;
  codigo: string;
  tipo: string;
  marca: string | null;
  estado: string;
  oficina: { nombre: string };
}

function BadgeEstadoMini({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; color: string; texto: string }> = {
    activo: { bg: '#e7f6ee', color: '#1e8e5a', texto: 'Activo' },
    mantenimiento: { bg: '#fff4e0', color: '#b8790a', texto: 'Mantenimiento' },
    baja: { bg: '#fdeaea', color: '#dc3545', texto: 'Dado de baja' },
  };
  const c = config[estado] ?? { bg: '#eee', color: '#555', texto: estado };
  return (
    <span style={{ backgroundColor: c.bg, color: c.color, padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
      {c.texto}
    </span>
  );
}

function Dashboard({ nombreUsuario, onNavegar }: DashboardProps) {
  const [totalOficinas, setTotalOficinas] = useState(0);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [totalActivos, setTotalActivos] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);

  const [misEquipos, setMisEquipos] = useState<MiEquipo[]>([]);
  const [vinculado, setVinculado] = useState(false);

  useEffect(() => {
    api.get('/oficinas').then((res) => setTotalOficinas(res.data.length)).catch(() => {});
    api.get('/empleados').then((res) => setTotalEmpleados(res.data.length)).catch(() => {});
    api.get('/activos').then((res) => {
      setTotalActivos(res.data.length);
      setPendientes(res.data.filter((a: any) => !a.responsableId).length);
      const suma = res.data.reduce((acc: number, a: any) => acc + (a.costo ?? 0), 0);
      setValorTotal(suma);
    }).catch(() => {});
    api.get('/auth/mis-equipos').then((res) => {
      setVinculado(res.data.vinculado);
      setMisEquipos(res.data.equipos ?? []);
    }).catch(() => {});
  }, []);

  const modulos = [
    {
      id: 'oficinas' as const,
      icono: '🏢',
      titulo: 'Oficinas',
      descripcion: 'Agencias y sucursales de la cooperativa',
      contador: totalOficinas,
      etiqueta: totalOficinas === 1 ? 'oficina' : 'oficinas',
      color: '#1f1b3d',
      fondoIcono: '#eceafc',
    },
    {
      id: 'empleados' as const,
      icono: '👥',
      titulo: 'Empleados',
      descripcion: 'Personal registrado por oficina',
      contador: totalEmpleados,
      etiqueta: totalEmpleados === 1 ? 'empleado' : 'empleados',
      color: '#b8842e',
      fondoIcono: '#fdf3e2',
    },
    {
      id: 'activos' as const,
      icono: '🖥️',
      titulo: 'Activos',
      descripcion: 'Equipos tecnológicos y su estado',
      contador: totalActivos,
      etiqueta: totalActivos === 1 ? 'activo' : 'activos',
      color: '#1e8e5a',
      fondoIcono: '#e7f6ee',
    },
  ];

  const valorFormateado = valorTotal.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#1f1b3d', marginBottom: '0.4rem' }}>
          Bienvenido, {nombreUsuario.split(' ')[0]} 👋
        </h2>
        <p style={{ color: '#666', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.5 }}>
          Este es el sistema de gestión de inventario de activos de información de la
          Cooperativa de Ahorro y Crédito Gañansol. Aquí puedes administrar las oficinas,
          el personal y los equipos tecnológicos de toda la cooperativa de forma
          centralizada y segura.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #b8842e' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f1b3d' }}>{totalActivos}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>Equipos registrados</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #b8842e' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f1b3d' }}>{totalOficinas}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>Oficinas activas</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #b8842e' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f1b3d' }}>{totalEmpleados}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>Empleados registrados</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #b8842e' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f1b3d' }}>{pendientes}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>Sin responsable asignado</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #2f8f6b' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f1b3d' }}>{valorFormateado}</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.2rem' }}>Valor total del inventario</div>
        </div>
      </div>

      {vinculado && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '0.8rem' }}>
            Mis equipos asignados ({misEquipos.length})
          </h3>
          {misEquipos.length === 0 ? (
            <p style={{ color: '#888', fontSize: '0.85rem' }}>No tienes equipos asignados actualmente.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.7rem' }}>
              {misEquipos.map((eq) => (
                <div key={eq.id} style={{ border: '1px solid #f0eee6', borderRadius: '10px', padding: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#1f1b3d' }}>{eq.codigo}</strong>
                    <BadgeEstadoMini estado={eq.estado} />
                  </div>
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                    {eq.tipo} {eq.marca ? `— ${eq.marca}` : ''}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#999' }}>
                    {eq.oficina?.nombre}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '1rem', color: '#444', marginBottom: '1rem', fontWeight: 600 }}>
        Accede a un módulo
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {modulos.map((m) => (
          <div
            key={m.id}
            onClick={() => onNavegar(m.id)}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.8rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              borderTop: `5px solid ${m.color}`,
              position: 'relative',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{
              width: '54px', height: '54px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', marginBottom: '1rem', backgroundColor: m.fondoIcono,
            }}>
              {m.icono}
            </div>
            <h3 style={{ color: '#1f1b3d', fontSize: '1.15rem', marginBottom: '0.4rem' }}>{m.titulo}</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>{m.descripcion}</p>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#333' }}>
              {m.contador} {m.etiqueta}
            </div>
            <div style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem', color: '#ccc', fontSize: '1.3rem' }}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;