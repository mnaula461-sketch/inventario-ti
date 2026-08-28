import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Oficina {
  id: number;
  nombre: string;
}

interface Activo {
  id: number;
  tipo: string;
  estado: string;
  oficinaId: number;
  responsableId: number | null;
  oficina: Oficina;
  costo: number | null;
  createdAt: string;
}

const COLORES = ['#1f1b3d', '#b8842e', '#2f8f6b', '#c0443f', '#4a3f8f', '#9c6f24', '#0d9488', '#7c3aed'];

function Reportes() {
  const [activos, setActivos] = useState<Activo[]>([]);

  useEffect(() => {
    api.get('/activos')
      .then((res) => setActivos(res.data))
      .catch((error) => console.error('Error al cargar activos:', error));
  }, []);

  // Equipos por oficina
  const porOficina: Record<string, number> = {};
  activos.forEach((a) => {
    const nombre = a.oficina?.nombre ?? 'Sin oficina';
    porOficina[nombre] = (porOficina[nombre] ?? 0) + 1;
  });
  const datosOficina = Object.entries(porOficina).map(([nombre, cantidad]) => ({ nombre, cantidad }));

  // Equipos por estado
  const porEstado: Record<string, number> = {};
  activos.forEach((a) => {
    const estado = a.estado === 'activo' ? 'Activo' : a.estado === 'mantenimiento' ? 'Mantenimiento' : a.estado === 'baja' ? 'Dado de baja' : a.estado;
    porEstado[estado] = (porEstado[estado] ?? 0) + 1;
  });
  const datosEstado = Object.entries(porEstado).map(([nombre, value]) => ({ nombre, value }));

  // Equipos por tipo (top 10)
  const porTipo: Record<string, number> = {};
  activos.forEach((a) => {
    const tipo = (a.tipo ?? 'Sin tipo').trim().toUpperCase();
    porTipo[tipo] = (porTipo[tipo] ?? 0) + 1;
  });
  const datosTipo = Object.entries(porTipo)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  // Con/sin responsable
  const conResponsable = activos.filter((a) => a.responsableId).length;
  const sinResponsable = activos.length - conResponsable;
  const datosResponsable = [
    { nombre: 'Con responsable', value: conResponsable },
    { nombre: 'Sin responsable', value: sinResponsable },
  ];

  // Valor del inventario por oficina
  const valorPorOficina: Record<string, number> = {};
  activos.forEach((a) => {
    const nombre = a.oficina?.nombre ?? 'Sin oficina';
    valorPorOficina[nombre] = (valorPorOficina[nombre] ?? 0) + (a.costo ?? 0);
  });
  const datosValorOficina = Object.entries(valorPorOficina)
    .map(([nombre, valor]) => ({ nombre, valor: Number(valor.toFixed(2)) }))
    .filter((d) => d.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Antigüedad de los equipos (por año de registro)
  const porAnio: Record<string, number> = {};
  activos.forEach((a) => {
    const anio = new Date(a.createdAt).getFullYear();
    porAnio[anio] = (porAnio[anio] ?? 0) + 1;
  });
  const datosAntiguedad = Object.entries(porAnio)
    .map(([anio, cantidad]) => ({ anio, cantidad }))
    .sort((a, b) => Number(a.anio) - Number(b.anio));

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '1.2rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: '1.5rem',
  };

  return (
    <div>
      <h2 style={{ color: '#1f1b3d', marginBottom: '1.5rem' }}>Reportes</h2>

      <div style={cardStyle}>
        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Equipos por oficina</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={datosOficina}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#1f1b3d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {datosValorOficina.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Valor del inventario por oficina (USD)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosValorOficina}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Valor']} />
              <Bar dataKey="valor" fill="#b8842e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Equipos por estado</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={datosEstado} dataKey="value" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} label>
                {datosEstado.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Con / sin responsable</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={datosResponsable} dataKey="value" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} label>
                <Cell fill="#2f8f6b" />
                <Cell fill="#c0443f" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Equipos registrados por año</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={datosAntiguedad}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#2f8f6b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: '#1f1b3d', fontSize: '1rem', marginBottom: '1rem' }}>Top 10 tipos de equipo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosTipo} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={100} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#b8842e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Reportes;