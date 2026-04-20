import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000/api/';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: JSON_HEADERS,
});

// Token almacenado en memoria — se setea desde el componente que tiene la sesión
// para evitar llamar getSession() (fetch a /api/auth/session) en cada request.
let _accessToken: string | null = null;

export function setApiToken(token: string | null) {
  _accessToken = token;
}

// Interceptor para inyectar el token y la API Key
api.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    config.headers['X-Api-Key'] = apiKey;
  }
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});


export const getEmprendedores = () => api.get('/emprendedor/');

export const getEmprendedor = (id: number) => api.get(`/emprendedor/${id}/`);

export const deleteEmprendedor = (id: number) => api.delete(`/emprendedor/${id}/`);

export const createEmprendedor = (data: unknown) => {
  if (data instanceof FormData) {
    return api.post('/emprendedor/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/emprendedor/', data);
};

export const updateEmprendedor = (id: number, data: unknown) => {
  if (data instanceof FormData) {
    return api.patch(`/emprendedor/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.patch(`/emprendedor/${id}/`, data);
};


export const getEmprendimientos = () => api.get('/emprendimiento/');

export const getEmprendimiento = (id: number) => api.get(`/emprendimiento/${id}/`);



export const getSituacionesFiscales = () => api.get('/situacion-fiscal/');

export const getSituacionFiscal = (id: number) => api.get(`/situacion-fiscal/${id}/`);

export const createSituacionFiscal = (data: { nombre: string }) => api.post('/situacion-fiscal/', data);

export const updateSituacionFiscal = (id: number, data: { nombre: string }) => api.patch(`/situacion-fiscal/${id}/`, data);

export const deleteSituacionFiscal = (id: number) => api.delete(`/situacion-fiscal/${id}/`);

export const getMediosDePago = () => api.get('/medio-de-pago/');

export const getMedioDePago = (id: number) => api.get(`/medio-de-pago/${id}/`);

export const createMedioDePago = (data: { nombre: string }) => api.post('/medio-de-pago/', data);

export const updateMedioDePago = (id: number, data: { nombre: string }) => api.patch(`/medio-de-pago/${id}/`, data);

export const deleteMedioDePago = (id: number) => api.delete(`/medio-de-pago/${id}/`);

export const getRubros = () => api.get('/rubro/');
export const getRubro = (id: number) => api.get(`/rubro/${id}/`);
export const createRubro = (data: any) => api.post('/rubro/', data);
export const updateRubro = (id: number, data: any) => api.patch(`/rubro/${id}/`, data);
export const deleteRubro = (id: number) => api.delete(`/rubro/${id}/`);

export const getServicios = () => api.get('/servicio/');
export const getServicio = (id: number) => api.get(`/servicio/${id}/`);
export const createServicio = (data: any) => api.post('/servicio/', data);
export const updateServicio = (id: number, data: any) => api.patch(`/servicio/${id}/`, data);
export const deleteServicio = (id: number) => api.delete(`/servicio/${id}/`);

export const getLocalidades = (search?: string) => {
  const params: Record<string, string> = { tipo: 'LO' };
  if (search && search.trim()) params['search'] = search.trim();
  return api.get('/ubicacion/', { params });
};

