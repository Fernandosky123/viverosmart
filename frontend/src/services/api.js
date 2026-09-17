import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Interceptor de peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestor de modo Offline
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine || error.message === 'Network Error') {
      console.warn('¡Sin conexión! Guardando petición en cola local...');
      
      // Guardar en cola para sincronizar luego (Solo POST/PUT/DELETE)
      if (error.config && ['post', 'put', 'delete'].includes(error.config.method)) {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        queue.push({
          url: error.config.url,
          method: error.config.method,
          data: error.config.data,
          headers: error.config.headers
        });
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
      }

      // Retornar promesa resuelta mock para que la app no crashee
      return Promise.resolve({ data: { offline: true, message: 'Guardado en modo sin conexión' } });
    }
    return Promise.reject(error);
  }
);

// Función para sincronizar cuando vuelva el internet
export const syncOfflineData = async () => {
  if (navigator.onLine) {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length > 0) {
      console.log(`Sincronizando ${queue.length} operaciones pendientes...`);
      for (const req of queue) {
        try {
          await axios({ method: req.method, url: req.url, data: req.data, headers: req.headers });
        } catch (e) {
          console.error('Fallo al sincronizar petición', e);
        }
      }
      localStorage.removeItem('offlineQueue');
      console.log('¡Sincronización completada!');
    }
  }
};

window.addEventListener('online', syncOfflineData);

export default api;
