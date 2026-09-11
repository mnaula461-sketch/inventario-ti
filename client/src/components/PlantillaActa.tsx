import { useState, useEffect } from 'react';
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

  useEffect(() => {
    api.get('/plantilla-acta')
      .then((res) => setPlantilla(res.data))
      .catch(() => setError('No se pudo cargar la plantilla.'))
      .finally(() => setCargando(false));
  }, []);

  const actualizarCampo = (campo: keyof Plantilla, valor: string) => {
    if (!plantilla) return;
    setPlantilla({ ...plantilla, [campo]: valor });
  };

  const [generandoPreview, setGenerandoPreview] = useState(false);

  const verVistaPrevia = async () => {
    if (!plantilla) return;
    setGenerandoPreview(true);
    try {
      const res = await api.post('/plantilla-acta/vista-previa', {
        codigo: plantilla.codigo,
        version: plantilla.version,
        fechaAprobacion: plantilla.fechaAprobacion,
        responsable: plantilla.responsable,
        tituloDocumento: plantilla.tituloDocumento,
        clausula: plantilla.clausula,
        observaciones: plantilla.observaciones,
        listaSoftware: plantilla.listaSoftware,
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      alert('Error al generar la vista previa.');
    } finally {
      setGenerandoPreview(false);
    }
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
        Estos textos se usan al generar el PDF del Acta de Entrega-Recepción para cada equipo.
      </p>

      <form onSubmit={guardar} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: '700px' }}>
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

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-outline" onClick={verVistaPrevia} disabled={generandoPreview}>
            {generandoPreview ? 'Generando...' : '👁️ Vista previa'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlantillaActaEditor;