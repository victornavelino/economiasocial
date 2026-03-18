import axios, { AxiosInstance } from 'axios';
import { Emprendedor } from './types';
const url='http://127.0.0.1:8000/api'
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api: AxiosInstance = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmprendedores = () => api.get<Emprendedor[]>('/emprendedor/');
export const getEmprendedor = (id: number) => api.get<Emprendedor>(`/emprendedor/${id}/`);
export const createEmprendedor = (data) => api.post('/emprendedores/', data);
export const deleteEmprendedor = (id: number) => api.delete(`/emprendedor/${id}/`);