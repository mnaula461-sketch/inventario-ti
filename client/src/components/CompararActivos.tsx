interface Activo {
  id: number;
  codigo: string;
  tipo: string;
  marca: string | null;
  claseEquipo: string | null;
  numeroSerie: string | null;
  procesador: string | null;
  ram: string | null;
  disco: string | null;
  sistemaOperativo: string | null;
  monitor: string | null;
  estado: string;
  costo: number | null;
  oficina: { nombre: string };
  responsable: { nombre: string } | null;
}

interface CompararActivosProps {
  activoA: Activo;
  activoB: Activo;
  onVolver: () => void;
}

const FILAS = [
  { campo: 'codigo', etiqueta: 'Código' },
  { campo: 'tipo', etiqueta: 'Tipo' },
  { campo: 'marca', etiqueta: 'Marca' },
  { campo: 'claseEquipo', etiqueta: 'Clase de equipo' },
  { campo: 'numeroSerie', etiqueta: 'Número de serie' },
  { campo: 'procesador', etiqueta: 'Procesador' },
  { campo: 'ram', etiqueta: 'RAM' },
  { campo: 'disco', etiqueta: 'Disco' },
  { campo: 'sistemaOperativo', etiqueta: 'Sistema operativo' },
  { campo: 'monitor', etiqueta: 'Monitor' },
  { campo: 'estado', etiqueta: 'Estado' },
  { campo: 'oficina', etiqueta: 'Oficina' },
  { campo: 'responsable', etiqueta: 'Responsable' },
  { campo: 'costo', etiqueta: 'Costo' },
];

function obtenerValor(activo: Activo, campo: string): string {
  if (campo === 'oficina') return activo.oficina?.nombre ?? '—';
  if (campo === 'responsable') return activo.responsable?.nombre ?? 'Sin asignar';
  if (campo === 'costo') return activo.costo != null ? `$${activo.costo.toFixed(2)}` : '—';
  return String((activo as any)[campo] ?? '—');
}

function CompararActivos({ activoA, activoB, onVolver }: CompararActivosProps) {
  return (
    <div>
      <button onClick={onVolver} className="btn-outline" style={{ marginBottom: '1.2rem' }}>
        ← Volver al listado
      </button>

      <h2 style={{ color: '#1f1b3d', marginBottom: '1.5rem' }}>Comparar equipos</h2>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr' }}>
          <div style={{ background: '#faf8f3', padding: '0.9rem' }}></div>
          <div style={{ background: '#1f1b3d', color: 'white', padding: '0.9rem', textAlign: 'center', fontWeight: 700 }}>
            {activoA.codigo}
          </div>
          <div style={{ background: '#1f1b3d', color: 'white', padding: '0.9rem', textAlign: 'center', fontWeight: 700 }}>
            {activoB.codigo}
          </div>

          {FILAS.map((fila, i) => {
            const valorA = obtenerValor(activoA, fila.campo);
            const valorB = obtenerValor(activoB, fila.campo);
            const distintos = valorA !== valorB;
            const fondo = i % 2 === 0 ? '#fff' : '#fafaf7';
            return (
              <div key={fila.campo} style={{ display: 'contents' }}>
                <div style={{ padding: '0.7rem 0.9rem', fontSize: '0.82rem', color: '#888', fontWeight: 600, background: fondo, borderTop: '1px solid #f0eee6' }}>
                  {fila.etiqueta}
                </div>
                <div style={{ padding: '0.7rem 0.9rem', fontSize: '0.88rem', background: distintos ? '#fdf3d8' : fondo, borderTop: '1px solid #f0eee6', textAlign: 'center' }}>
                  {valorA}
                </div>
                <div style={{ padding: '0.7rem 0.9rem', fontSize: '0.88rem', background: distintos ? '#fdf3d8' : fondo, borderTop: '1px solid #f0eee6', textAlign: 'center' }}>
                  {valorB}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.8rem' }}>
        🟡 Las filas resaltadas indican diferencias entre ambos equipos.
      </p>
    </div>
  );
}

export default CompararActivos;