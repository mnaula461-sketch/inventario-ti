import api from '../api';

interface Oficina {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
  cargo: string | null;
}

interface Activo {
  id: number;
  codigo: string;
  tipo: string;
  ip: string | null;
  macAddress: string | null;
  puertoRed: string | null;
  departamento: string | null;
  marca: string | null;
  claseEquipo: string | null;
  numeroSerie: string | null;
  monitor: string | null;
  serieMonitor: string | null;
  codigoContable: string | null;
  parlantes: string | null;
  placaMadre: string | null;
  procesador: string | null;
  ram: string | null;
  disco: string | null;
  estadoRaton: string | null;
  estadoTeclado: string | null;
  estadoDisco: string | null;
  sistemaOperativo: string | null;
  mantenimiento: string | null;
  actualizable: string | null;
  anydesk: string | null;
  upgrade: string | null;
  recomendacion: string | null;
  saleA: string | null;
  entraA: string | null;
  estado: string;
  antivirus: string | null;
  criterio: string | null;
  oficina: Oficina;
  responsable: Empleado | null;
  createdAt: string;
}

interface ActivoDetalleProps {
  activo: Activo;
  onVolver: () => void;
  onEditar: () => void;
}

function Fila({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f5' }}>
      <div style={{ width: '160px', color: '#888', fontSize: '0.85rem' }}>{label}</div>
      <div style={{ flex: 1, fontSize: '0.9rem', color: '#222' }}>{valor || '—'}</div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ color: '#2c2560', fontSize: '1rem', marginBottom: '0.8rem' }}>{titulo}</h3>
      {children}
    </div>
  );
}

function BadgeEstado({ estado }: { estado: string }) {
  const config: Record<string, { bg: string; color: string; texto: string }> = {
    activo: { bg: '#e7f6ee', color: '#1e8e5a', texto: 'Activo' },
    mantenimiento: { bg: '#fff4e0', color: '#b8790a', texto: 'Mantenimiento' },
    baja: { bg: '#fdeaea', color: '#dc3545', texto: 'Dado de baja' },
  };
  const c = config[estado] ?? { bg: '#eee', color: '#555', texto: estado };
  return (
    <span style={{ backgroundColor: c.bg, color: c.color, padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
      {c.texto}
    </span>
  );
}

function ActivoDetalle({ activo, onVolver, onEditar }: ActivoDetalleProps) {
  return (
    <div>
      <button onClick={onVolver} className="btn-outline" style={{ marginBottom: '1.2rem' }}>
        ← Volver al listado
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#2c2560', fontSize: '1.5rem', marginBottom: '0.3rem' }}>
            {activo.codigo} — {activo.tipo}
          </h2>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {activo.marca} {activo.claseEquipo}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <BadgeEstado estado={activo.estado} />
          <button onClick={onEditar} className="btn-edit">✏️ Editar</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        <Seccion titulo="Ubicación y responsable">
          <Fila label="Oficina" valor={activo.oficina?.nombre} />
          <Fila label="Departamento" valor={activo.departamento} />
          <Fila label="Responsable" valor={activo.responsable?.nombre} />
          <Fila label="Cargo" valor={activo.responsable?.cargo} />
        </Seccion>

        <Seccion titulo="Identificación">
          <Fila label="Código" valor={activo.codigo} />
          <Fila label="Número de serie" valor={activo.numeroSerie} />
          <Fila label="Código contable" valor={activo.codigoContable} />
          <Fila label="Clase de equipo" valor={activo.claseEquipo} />
        </Seccion>

        <Seccion titulo="Red">
          <Fila label="IP" valor={activo.ip} />
          <Fila label="MAC Address" valor={activo.macAddress} />
          <Fila label="Puerto de red" valor={activo.puertoRed} />
          <Fila label="AnyDesk" valor={activo.anydesk} />
        </Seccion>

        <Seccion titulo="Hardware">
          <Fila label="Procesador" valor={activo.procesador} />
          <Fila label="RAM" valor={activo.ram} />
          <Fila label="Disco" valor={activo.disco} />
          <Fila label="Placa madre" valor={activo.placaMadre} />
          <Fila label="Monitor" valor={activo.monitor} />
          <Fila label="Serie monitor" valor={activo.serieMonitor} />
          <Fila label="Parlantes" valor={activo.parlantes} />
          <Fila label="Sistema operativo" valor={activo.sistemaOperativo} />
        </Seccion>

        <Seccion titulo="Estado y mantenimiento">
          <Fila label="Estado mouse" valor={activo.estadoRaton} />
          <Fila label="Estado teclado" valor={activo.estadoTeclado} />
          <Fila label="Estado disco" valor={activo.estadoDisco} />
          <Fila label="Mantenimiento" valor={activo.mantenimiento} />
          <Fila label="Actualizable" valor={activo.actualizable} />
          <Fila label="Antivirus" valor={activo.antivirus} />
        </Seccion>

        <Seccion titulo="Movimientos y recomendaciones">
          <Fila label="Sale a" valor={activo.saleA} />
          <Fila label="Entra a" valor={activo.entraA} />
          <Fila label="Upgrade" valor={activo.upgrade} />
          <Fila label="Recomendación" valor={activo.recomendacion} />
          <Fila label="Criterio" valor={activo.criterio} />
        </Seccion>
      </div>
    </div>
  );
}

export default ActivoDetalle;