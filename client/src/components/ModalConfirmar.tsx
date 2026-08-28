interface ModalConfirmarProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  peligro?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function ModalConfirmar({ abierto, titulo, mensaje, textoConfirmar = 'Confirmar', peligro = true, onConfirmar, onCancelar }: ModalConfirmarProps) {
  if (!abierto) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(31, 27, 61, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onCancelar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '14px', padding: '1.8rem',
          maxWidth: '380px', width: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <h3 style={{ color: '#1f1b3d', fontSize: '1.15rem', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' }}>
          {titulo}
        </h3>
        <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {mensaje}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button className="btn-outline" onClick={onCancelar}>
            Cancelar
          </button>
          <button
            className={peligro ? 'btn-delete' : 'btn-primary'}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmar;