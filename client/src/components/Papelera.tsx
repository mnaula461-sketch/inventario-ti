import { useState, useEffect } from 'react';
import api from '../api';

interface Oficina {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
}

interface Activo {
  id: number;
  codigo: string;
  tipo: string;
  marca: string | null;
  fechaEliminado: string | null;
  oficina: Oficina;
  responsable: Empleado | null;
}

interface PapeleraProps {
  esAdmin: boolean;
}

function Papelera({ esAdmin }: PapeleraProps) {
  const [activos, setActivos] = useState<Activo[]>([]);

  const cargar = () => {
    api.get('/activos/papelera')
      .then((res) => setActivos(res.data))
      .catch((error) => console.error('Error al cargar papelera:', error));
  };

  useEffect(() => {
    cargar();
  }, []);

  const restaurar = async (id: number) => {
    await api.put(`/activos/${id}/restaurar`);
    cargar();
  };

  const eliminarDefinitivo = async (id: number, codigo: string) => {
    const confirmar = window.confirm(`¿Eliminar PERMANENTEMENTE el activo "${codigo}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;
    try {
      await api.delete(`/activos/${id}/definitivo`);
      cargar();
    } catch (error: any) {
      alert(error.response?.data?.error ?? 'Error al eliminar definitivamente');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#1f1b3d' }}>Papelera de reciclaje</h2>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
        Equipos eliminados. Puedes restaurarlos{esAdmin ? ' o borrarlos definitivamente' : ''}.
        {!esAdmin && ' Solo un administrador puede borrar definitivamente.'}
      </p>

      {activos.length === 0 ? (
        <p style={{ color: '#888' }}>La papelera está vacía.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Código</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Marca</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Oficina</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Eliminado el</th>
              <th style={{ padding: '0.5rem', width: '160px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos.map((activo) => (
              <tr key={activo.id}>
                <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.codigo}</td>
                <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.tipo}</td>
                <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.marca}</td>
                <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>{activo.oficina?.nombre}</td>
                <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                  {activo.fechaEliminado ? new Date(activo.fechaEliminado).toLocaleString('es-EC') : '—'}
                </td>
                <td style={{ padding: '0.6rem 0.5rem', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button className="btn-edit" onClick={() => restaurar(activo.id)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }} title="Restaurar">
                      ♻️ Restaurar
                    </button>
                    {esAdmin && (
                      <button className="btn-delete" onClick={() => eliminarDefinitivo(activo.id, activo.codigo)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }} title="Eliminar definitivamente">
                        🗑️ Borrar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Papelera;