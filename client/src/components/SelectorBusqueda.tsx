import { useState, useRef, useEffect } from 'react';

interface Opcion {
  id: number;
  etiqueta: string;
}

interface SelectorBusquedaProps {
  opciones: Opcion[];
  valorId: string;
  onSeleccionar: (id: string) => void;
  placeholder?: string;
  permitirVacio?: boolean;
  textoVacio?: string;
}

function SelectorBusqueda({ opciones, valorId, onSeleccionar, placeholder, permitirVacio, textoVacio }: SelectorBusquedaProps) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const contenedorRef = useRef<HTMLDivElement>(null);

  const opcionSeleccionada = opciones.find((o) => String(o.id) === valorId);

  useEffect(() => {
    function clickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setTexto('');
      }
    }
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  const opcionesFiltradas = opciones.filter((o) =>
    o.etiqueta.toLowerCase().includes(texto.toLowerCase())
  );

  const inputStyle = { width: '100%', padding: '0.4rem', fontSize: '0.9rem' };

  return (
    <div ref={contenedorRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={abierto ? texto : (opcionSeleccionada?.etiqueta ?? '')}
        onChange={(e) => setTexto(e.target.value)}
        onFocus={() => { setAbierto(true); setTexto(''); }}
        placeholder={placeholder}
        style={inputStyle}
      />
      {abierto && (
        <div style={{
          position: 'absolute', top: '105%', left: 0, right: 0,
          background: 'white', border: '1px solid #e2e0f0', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: '220px', overflowY: 'auto', zIndex: 50,
        }}>
          {permitirVacio && (
            <div
              onClick={() => { onSeleccionar(''); setAbierto(false); setTexto(''); }}
              style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', color: '#888' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              {textoVacio ?? '-- Ninguno --'}
            </div>
          )}
          {opcionesFiltradas.length === 0 ? (
            <div style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: '#aaa' }}>Sin coincidencias</div>
          ) : (
            opcionesFiltradas.map((o) => (
              <div
                key={o.id}
                onClick={() => { onSeleccionar(String(o.id)); setAbierto(false); setTexto(''); }}
                style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', fontSize: '0.88rem' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                {o.etiqueta}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SelectorBusqueda;