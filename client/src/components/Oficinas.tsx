import { useState, useEffect, useRef } from 'react';
import api from '../api';
import ModalConfirmar from './ModalConfirmar';
import MapaOficinas from './MapaOficinas';

interface Oficina {
  id: number;
  nombre: string;
  direccion: string | null;
}

interface OficinasProps {
  onVerEnActivos: (oficinaId: number) => void;
}

const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem' };
const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };

const TODAS_LAS_COLUMNAS_OF = [
  { campo: 'nombre', etiqueta: 'Nombre' },
  { campo: 'direccion', etiqueta: 'Dirección' },
];
const COLUMNAS_OF_DEFECTO = ['nombre', 'direccion'];

function Oficinas({ onVerEnActivos }: OficinasProps) {
  const [subvista, setSubvista] = useState<'lista' | 'mapa'>('lista');

  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [columnasVisibles, setColumnasVisibles] = useState<string[]>(() => {
    const guardadas = localStorage.getItem('columnasOficinas');
    return guardadas ? JSON.parse(guardadas) : COLUMNAS_OF_DEFECTO;
  });
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const menuColumnasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickFuera(e: MouseEvent) {
      if (menuColumnasRef.current && !menuColumnasRef.current.contains(e.target as Node)) {
        setMenuColumnasAbierto(false);
      }
    }
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  const alternarColumna = (campo: string) => {
    setColumnasVisibles((prev) => {
      const nuevo = prev.includes(campo) ? prev.filter((c) => c !== campo) : [...prev, campo];
      localStorage.setItem('columnasOficinas', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const cargarOficinas = () => {
    api.get('/oficinas')
      .then((res) => setOficinas(res.data))
      .catch((error) => console.error('Error al cargar oficinas:', error));
  };

  useEffect(() => {
    cargarOficinas();
  }, []);

  const guardarOficina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoId) {
      await api.put(`/oficinas/${editandoId}`, { nombre, direccion });
    } else {
      await api.post('/oficinas', { nombre, direccion });
    }
    setNombre('');
    setDireccion('');
    setEditandoId(null);
    setMostrarFormulario(false);
    cargarOficinas();
  };

  const empezarEdicion = (oficina: Oficina) => {
    setEditandoId(oficina.id);
    setNombre(oficina.nombre);
    setDireccion(oficina.direccion ?? '');
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setDireccion('');
    setMostrarFormulario(false);
  };

  const [oficinaAEliminar, setOficinaAEliminar] = useState<Oficina | null>(null);

  const confirmarEliminarOficina = async () => {
    if (!oficinaAEliminar) return;
    try {
      await api.delete(`/oficinas/${oficinaAEliminar.id}`);
      setOficinaAEliminar(null);
      cargarOficinas();
    } catch (error: any) {
      setOficinaAEliminar(null);
      alert(error.response?.data?.error ?? 'Error al eliminar la oficina');
    }
  };

  const oficinasFiltradas = oficinas.filter((of) => {
    const texto = busqueda.toLowerCase();
    return of.nombre.toLowerCase().includes(texto) || (of.direccion ?? '').toLowerCase().includes(texto);
  });

  const botonSubvista = (activa: boolean) => ({
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    backgroundColor: activa ? '#1f1b3d' : 'transparent',
    color: activa ? 'white' : '#555',
    border: activa ? 'none' : '1px solid #e3ddd0',
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#1f1b3d', margin: 0 }}>Oficinas</h2>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button style={botonSubvista(subvista === 'lista')} onClick={() => setSubvista('lista')}>
            📋 Lista
          </button>
          <button style={botonSubvista(subvista === 'mapa')} onClick={() => setSubvista('mapa')}>
            🗺️ Mapa
          </button>
        </div>
      </div>

      {subvista === 'mapa' ? (
        <MapaOficinas onVerOficina={onVerEnActivos} />
      ) : (
        <>
          <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.6rem' }}>
            {!mostrarFormulario && (
              <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
                + Agregar oficina
              </button>
            )}
            <div ref={menuColumnasRef} style={{ position: 'relative' }}>
              <button className="btn-outline" onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)}>
                ⚙️ Columnas ({columnasVisibles.length})
              </button>
              {menuColumnasAbierto && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0,
                  background: 'white', border: '1px solid #e3ddd0', borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '0.7rem',
                  zIndex: 100, width: '180px',
                }}>
                  {TODAS_LAS_COLUMNAS_OF.map((col) => (
                    <label key={col.campo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.2rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={columnasVisibles.includes(col.campo)}
                        onChange={() => alternarColumna(col.campo)}
                      />
                      {col.etiqueta}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {mostrarFormulario && (
            <form onSubmit={guardarOficina} style={{ marginBottom: '1.5rem', border: '1px solid #e2e0f0', padding: '1.2rem', borderRadius: '10px', backgroundColor: '#fafaff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nombre de la oficina</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginRight: '0.5rem' }}>
                {editandoId ? 'Guardar cambios' : 'Agregar oficina'}
              </button>
              <button type="button" className="btn-outline" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </form>
          )}

          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ ...inputStyle, marginBottom: '1rem' }}
          />

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <thead>
              <tr>
                {columnasVisibles.includes('nombre') && <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>}
                {columnasVisibles.includes('direccion') && <th style={{ textAlign: 'left', padding: '0.5rem' }}>Dirección</th>}
                <th style={{ padding: '0.5rem', width: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {oficinasFiltradas.map((oficina) => (
                <tr key={oficina.id}>
                  {columnasVisibles.includes('nombre') && <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{oficina.nombre}</td>}
                  {columnasVisibles.includes('direccion') && <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{oficina.direccion}</td>}
                  <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                      <button className="btn-edit" onClick={() => empezarEdicion(oficina)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Editar">
                        ✏️
                      </button>
                      <button className="btn-delete" onClick={() => setOficinaAEliminar(oficina)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <ModalConfirmar
        abierto={!!oficinaAEliminar}
        titulo="Eliminar oficina"
        mensaje={`¿Seguro que quieres eliminar "${oficinaAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirmar={confirmarEliminarOficina}
        onCancelar={() => setOficinaAEliminar(null)}
      />
    </div>
  );
}

export default Oficinas;