interface NotificacionProps {
  mensaje: string;
  tipo: 'exito' | 'error';
  visible: boolean;
}

function Notificacion({ mensaje, tipo, visible }: NotificacionProps) {
  if (!visible) return null;

  const colores = {
    exito: { bg: '#e4f2ec', color: '#2f8f6b', borde: '#2f8f6b' },
    error: { bg: '#f7e6e5', color: '#c0443f', borde: '#c0443f' },
  };
  const c = colores[tipo];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: c.bg,
      color: c.color,
      border: `1.5px solid ${c.borde}`,
      padding: '0.8rem 1.4rem',
      borderRadius: '10px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      zIndex: 1000,
      fontSize: '0.9rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      animation: 'slideIn 0.3s ease-out',
    }}>
      {tipo === 'exito' ? '✅' : '⚠️'} {mensaje}
    </div>
  );
}

export default Notificacion;