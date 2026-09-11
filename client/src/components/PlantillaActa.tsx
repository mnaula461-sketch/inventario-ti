import { useState, useEffect, useRef } from 'react';
import api from '../api';

interface Plantilla {
  id: number;
  codigo: string;
  version: string;
  fechaAprobacion: string;
  responsable: string;
  tituloDocumento: string;
  clausula: string;
  observaciones: string;
  listaSoftware: string;
}

const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem' };
const labelStyle = { fontSize: '0.8rem', color: '#555', display: 'block', marginBottom: '0.2rem' };
const campoStyle = { marginBottom: '0.9rem' };

function PlantillaActaEditor() {
  const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [urlPreview, setUrlPreview] = useState('');
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get('/plantilla-acta')
      .then((res) => setPlantilla(res.data))
      .catch(() => setError('No se pudo cargar la plantilla.'))
      .finally(() => setCargando(false));
  }, []);

  const generarPreview = async (datos: Plantilla) => {
    setCargandoPreview(true);
    try {
      const res = await api.post('/plantilla-acta/vista-previa', {
        codigo: datos.codigo,
        version: datos.version,
        fechaAprobacion: datos.fechaAprobacion,
        responsable: datos.responsable,
        tituloDocumento: datos.tituloDocumento,
        clausula: datos.clausula,
        observaciones: datos.observaciones,
        listaSoftware: datos.listaSoftware,
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setUrlPreview((anterior) => {
        if (anterior) window.URL.revokeObjectURL(anterior);
        return url;
      });
    } catch {
      // silencioso: si falla la vista previa, no interrumpimos la edición
    } finally {
      setCargandoPreview(false);
    }
  };

  useEffect(() => {
    if (!plantilla) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      generarPreview(plantilla);
    }, 800);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [plantilla]);

  const actualizarCampo = (campo: keyof Plantilla, valor: string) => {
    if (!plantilla) return;
    setPlantilla({ ...plantilla, [campo]: valor });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantilla) return;
    setGuardando(true);
    setMensaje('');
    setError('');
    try {
      await api.put(`/plantilla-acta/${plantilla.id}`, {
        codigo: plantilla.codigo,
        version: plantilla.version,
        fechaAprobacion: plantilla.fechaAprobacion,
        responsable: plantilla.responsable,
        tituloDocumento: plantilla.tituloDocumento,
        clausula: plantilla.clausula,
        observaciones: plantilla.observaciones,
        listaSoftware: plantilla.listaSoftware,
      });
      setMensaje('Plantilla actualizada correctamente.');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Error al guardar la plantilla.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p style={{ color: '#888' }}>Cargando plantilla...</p>;
  }

  if (!plantilla) {
    return <p style={{ color: '#c0443f' }}>{error || 'No se pudo cargar la plantilla.'}</p>;
  }

  return (
    <div>
      <h2 style={{ color: '#1f1b3d' }}>Plantilla del Acta de Entrega</h2>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Edita los textos a la izquierda y observa la vista previa actualizarse a la derecha (con datos de ejemplo).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={guardar} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div style={campoStyle}>
              <label style={labelStyle}>Código del documento</label>
              <input type="text" value={plantilla.codigo} onChange={(e) => actualizarCampo('codigo', e.target.value)} style={inputStyle} />
            </div>
            <div style={campoStyle}>
              <label style={labelStyle}>Versión</label>
              <input type="text" value={plantilla.version} onChange={(e) => actualizarCampo('version', e.target.value)} style={inputStyle} />
            </div>
            <div style={campoStyle}>
              <label style={labelStyle}>Fecha de aprobación</label>
              <input type="text" value={plantilla.fechaAprobacion} onChange={(e) => actualizarCampo('fechaAprobacion', e.target.value)} style={inputStyle} placeholder="Ej: 01/01/2026" />
            </div>
            <div style={campoStyle}>
              <label style={labelStyle}>Responsable del documento</label>
              <input type="text" value={plantilla.responsable} onChange={(e) => actualizarCampo('responsable', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={campoStyle}>
            <label style={labelStyle}>Título del documento</label>
            <input type="text" value={plantilla.tituloDocumento} onChange={(e) => actualizarCampo('tituloDocumento', e.target.value)} style={inputStyle} />
          </div>

          <div style={campoStyle}>
            <label style={labelStyle}>Observaciones</label>
            <textarea value={plantilla.observaciones} onChange={(e) => actualizarCampo('observaciones', e.target.value)} style={{ ...inputStyle, minHeight: '70px', fontFamily: 'inherit' }} />
          </div>

          <div style={campoStyle}>
            <label style={labelStyle}>Cláusula</label>
            <textarea value={plantilla.clausula} onChange={(e) => actualizarCampo('clausula', e.target.value)} style={{ ...inputStyle, minHeight: '90px', fontFamily: 'inherit' }} />
          </div>

          <div style={campoStyle}>
            <label style={labelStyle}>Lista de software (referencia)</label>
            <textarea value={plantilla.listaSoftware} onChange={(e) => actualizarCampo('listaSoftware', e.target.value)} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }} />
          </div>

          {error && <p style={{ color: '#c0443f', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
          {mensaje && <p style={{ color: '#2f8f6b', fontSize: '0.85rem', marginBottom: '1rem' }}>{mensaje}</p>}

          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h3 style={{ color: '#1f1b3d', fontSize: '0.95rem', margin: 0 }}>Vista previa</h3>
            {cargandoPreview && <span style={{ fontSize: '0.78rem', color: '#888' }}>Actualizando...</span>}
          </div>
          {urlPreview ? (
            <iframe
              src={urlPreview}
              title="Vista previa del acta"
              style={{ width: '100%', height: '600px', border: '1px solid #f0eee6', borderRadius: '8px' }}
            />
          ) : (
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Generando vista previa...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlantillaActaEditor;