import axios, { AxiosInstance } from 'axios';
import { Emprendedor } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const getEmprendedor = (id: number) => api.get<Emprendedor>(`/emprendedores/${id}/`);