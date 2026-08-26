import { useState, useEffect, useRef } from 'react';
import api from '../api';

interface Resultado {
  tipo: 'oficina' | 'empleado' | 'activo';
  id: number;
  titulo: string;
  subtitulo: string;
}

interface BusquedaGlobalProps {
  onIrA: (vista: 'oficinas' | 'empleados' | 'activos') => void;
}

function BusquedaGlobal({ onIrA }: BusquedaGlobalProps) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [cargando, setCargando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  useEffect(() => {
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    setCargando(true);
    const timeout = setTimeout(() => {
      Promise.all([
        api.get('/oficinas'),
        api.get('/empleados'),
        api.get('/activos'),
      ]).then(([resOficinas, resEmpleados, resActivos]) => {
        const t = texto.toLowerCase();
        const encontrados: Resultado[] = [];

        resOficinas.data.forEach((o: any) => {
          if (o.nombre.toLowerCase().includes(t) || (o.direccion ?? '').toLowerCase().includes(t)) {
            encontrados.push({ tipo: 'oficina', id: o.id, titulo: o.nombre, subtitulo: o.direccion ?? '' });
          }
        });

        resEmpleados.data.forEach((e: any) => {
          if (e.nombre.toLowerCase().includes(t) || (e.cargo ?? '').toLowerCase().includes(t) || (e.correo ?? '').toLowerCase().includes(t)) {
            encontrados.push({ tipo: 'empleado', id: e.id, titulo: e.nombre, subtitulo: e.cargo ?? e.oficina?.nombre ?? '' });
          }
        });

        resActivos.data.forEach((a: any) => {
          if (
            a.codigo.toLowerCase().includes(t) ||
            a.tipo.toLowerCase().includes(t) ||
            (a.marca ?? '').toLowerCase().includes(t) ||
            (a.numeroSerie ?? '').toLowerCase().includes(t) ||
            (a.responsable?.nombre ?? '').toLowerCase().includes(t)
          ) {
            encontrados.push({ tipo: 'activo', id: a.id, titulo: a.codigo, subtitulo: `${a.tipo} — ${a.oficina?.nombre ?? ''}` });
          }
        });

        setResultados(encontrados.slice(0, 15));
        setCargando(false);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [texto]);

  const icono = { oficina: '🏢', empleado: '👥', activo: '🖥️' };
  const nombreVista = { oficina: 'oficinas' as const, empleado: 'empleados' as const, activo: 'activos' as const };

  const seleccionar = (r: Resultado) => {
    onIrA(nombreVista[r.tipo]);
    setAbierto(false);
    setTexto('');
  };

  return (
    <div ref={contenedorRef} style={{ position: 'relative' }}>
      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="btn-outline"
          style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
        >
          🔍 Buscar
        </button>
      ) : (
        <input
          autoFocus
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar oficinas, empleados, activos..."
          style={{ padding: '0.5rem 0.8rem', width: '280px', borderRadius: '8px', border: 'none' }}
        />
      )}

      {abierto && texto.trim().length >= 2 && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, width: '340px',
          background: 'white', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxHeight: '400px', overflowY: 'auto', zIndex: 100,
        }}>
          {cargando ? (
            <p style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>Buscando...</p>
          ) : resultados.length === 0 ? (
            <p style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>Sin resultados.</p>
          ) : (
            resultados.map((r) => (
              <div
                key={`${r.tipo}-${r.id}`}
                onClick={() => seleccionar(r)}
                style={{
                  padding: '0.7rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f0f0f5',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <span style={{ fontSize: '1.1rem' }}>{icono[r.tipo]}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#222', fontWeight: 600 }}>{r.titulo}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{r.subtitulo}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BusquedaGlobal;