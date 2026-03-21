import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const JSONAPI_HEADERS = {
  'Content-Type': 'application/vnd.api+json',
  'Accept': 'application/vnd.api+json',
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ── Emprendedor ──────────────────────────────────────────────────────────────
export const getEmprendedores = () =>
  axios.get(`${BASE_URL}/emprendedor/`, { headers: JSON_HEADERS });

export const getEmprendedor = (id: number) =>
  axios.get(`${BASE_URL}/emprendedor/${id}/`, { headers: JSON_HEADERS });

export const deleteEmprendedor = (id: number) =>
  axios.delete(`${BASE_URL}/emprendedor/${id}/`, { headers: JSON_HEADERS });

export const createEmprendedor = (data: unknown) =>
  axios.post(`${BASE_URL}/emprendedor/`, data, { headers: JSON_HEADERS });

// ── Situación fiscal y Medio de pago ────────────────────────────────────────
export const getSituacionesFiscales = () =>
  axios.get(`${BASE_URL}/situacion-fiscal/`, { headers: JSON_HEADERS });

export const getMediosDePago = () =>
  axios.get(`${BASE_URL}/medio-de-pago/`, { headers: JSON_HEADERS });