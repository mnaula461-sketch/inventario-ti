import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let mensaje = 'Ocurrió un error inesperado.';
    if (!error.response) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else if (error.response.data?.error) {
      mensaje = error.response.data.error;
    } else if (error.response.status === 401) {
      mensaje = 'Tu sesión expiró. Inicia sesión de nuevo.';
    } else if (error.response.status === 500) {
      mensaje = 'Error interno del servidor. Intenta de nuevo en unos momentos.';
    }
    window.dispatchEvent(new CustomEvent('api-error', { detail: mensaje }));
    return Promise.reject(error);
  }
);

export default api;