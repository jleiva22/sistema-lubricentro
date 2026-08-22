import { clientesData, vehiculosData, catalogoData, ordenesData, boletasData } from '../data/mockData';

const STORAGE_KEYS = {
  clientes: 'lubri_clientes',
  vehiculos: 'lubri_vehiculos',
  catalogo: 'lubri_catalogo',
  ordenes: 'lubri_ordenes',
  boletas: 'lubri_boletas',
};

const safeLocalStorage = {
  get: (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
};

const ensureSeed = () => {
  if (!safeLocalStorage.get(STORAGE_KEYS.clientes, null)) {
    safeLocalStorage.set(STORAGE_KEYS.clientes, clientesData);
  }
  if (!safeLocalStorage.get(STORAGE_KEYS.vehiculos, null)) {
    safeLocalStorage.set(STORAGE_KEYS.vehiculos, vehiculosData);
  }
  if (!safeLocalStorage.get(STORAGE_KEYS.catalogo, null)) {
    safeLocalStorage.set(STORAGE_KEYS.catalogo, catalogoData);
  }
  if (!safeLocalStorage.get(STORAGE_KEYS.ordenes, null)) {
    safeLocalStorage.set(STORAGE_KEYS.ordenes, ordenesData);
  }
  if (!safeLocalStorage.get(STORAGE_KEYS.boletas, null)) {
    safeLocalStorage.set(STORAGE_KEYS.boletas, boletasData);
  }
};

ensureSeed();

export const mockAPI = {
  clientes: {
    getAll: () => safeLocalStorage.get(STORAGE_KEYS.clientes, []),
    create: (cliente) => {
      const list = mockAPI.clientes.getAll();
      const next = { ...cliente, id: Date.now(), activo: true };
      const updated = [...list, next];
      safeLocalStorage.set(STORAGE_KEYS.clientes, updated);
      return next;
    },
  },
  vehiculos: {
    getAll: () => safeLocalStorage.get(STORAGE_KEYS.vehiculos, []),
    create: (vehiculo) => {
      const list = mockAPI.vehiculos.getAll();
      const next = { ...vehiculo, id: Date.now() };
      const updated = [...list, next];
      safeLocalStorage.set(STORAGE_KEYS.vehiculos, updated);
      return next;
    },
  },
  catalogo: {
    getAll: () => safeLocalStorage.get(STORAGE_KEYS.catalogo, []),
    create: (servicio) => {
      const list = mockAPI.catalogo.getAll();
      const next = { ...servicio, id: Date.now() };
      const updated = [...list, next];
      safeLocalStorage.set(STORAGE_KEYS.catalogo, updated);
      return next;
    },
  },
  ordenes: {
    getAll: () => safeLocalStorage.get(STORAGE_KEYS.ordenes, []),
    create: (orden) => {
      const list = mockAPI.ordenes.getAll();
      const next = { ...orden, id: Date.now(), estado: 'Pendiente' };
      const updated = [...list, next];
      safeLocalStorage.set(STORAGE_KEYS.ordenes, updated);
      return next;
    },
  },
  boletas: {
    getAll: () => safeLocalStorage.get(STORAGE_KEYS.boletas, []),
    create: (boleta) => {
      const list = mockAPI.boletas.getAll();
      const next = { ...boleta, id: Date.now(), pagado: true };
      const updated = [...list, next];
      safeLocalStorage.set(STORAGE_KEYS.boletas, updated);
      return next;
    },
  },
};

export default mockAPI;
