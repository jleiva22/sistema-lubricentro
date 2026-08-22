import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// Clientes
export const clientesAPI = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// Vehículos
export const vehiculosAPI = {
  getAll: () => api.get('/vehiculos'),
  getById: (id) => api.get(`/vehiculos/${id}`),
  getByPatente: (patente) => api.get(`/vehiculos/patente/${patente}`),
  create: (data) => api.post('/vehiculos', data),
  update: (id, data) => api.put(`/vehiculos/${id}`, data),
  delete: (id) => api.delete(`/vehiculos/${id}`),
};

// Catálogo de Servicios
export const catalogoAPI = {
  getAll: () => api.get('/catalogos'),
  getPublic: () => api.get('/catalogos/public'),
  getById: (id) => api.get(`/catalogos/${id}`),
  create: (data) => api.post('/catalogos', data),
  update: (id, data) => api.put(`/catalogos/${id}`, data),
  delete: (id) => api.delete(`/catalogos/${id}`),
};

// Órdenes de Trabajo
export const ordenesAPI = {
  getAll: () => api.get('/ordenes'),
  getById: (id) => api.get(`/ordenes/${id}`),
  create: (data) => api.post('/ordenes', data),
  createPublicReserva: (data) => api.post('/ordenes/public', data),
  updateEstado: (id, estado) => api.patch(`/ordenes/${id}/estado`, { estado }),
  pagar: (id) => api.patch(`/ordenes/${id}/pagar`),
  getBoleta: (id) => api.get(`/ordenes/${id}/boleta`),
  delete: (id) => api.delete(`/ordenes/${id}`),
};

// Boletas
export const boletasAPI = {
  getAll: () => api.get('/boletas'),
  getById: (id) => api.get(`/boletas/${id}`),
  getByOrden: (ordenId) => api.get(`/boletas/orden/${ordenId}`),
  createFromOrder: (ordenId) => api.post(`/boletas/orden/${ordenId}`),
  delete: (id) => api.delete(`/boletas/${id}`),
};

// Usuarios
export const usuariosAPI = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

export default api;
