'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmprendedores, deleteEmprendedor } from '@/app/services/api';
import { Edit, Trash2, Eye, Plus, User, Search } from 'lucide-react';

interface Emprendedor {
  emprendedor_id: number;
  nombre: string;
  apellido: string;
  documento_identidad: string;
  sexo: string;
  email: string;
  situacion_fiscal_nombre: string;
  medio_de_pago_nombre: string;
}

const SEXO_LABEL: Record<string, string> = { m: 'Masculino', f: 'Femenino', o: 'Otro' };

function capitalize(str: string) {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export default function EmprendedoresPage() {
  const [emprendedores, setEmprendedores] = useState<Emprendedor[]>([]);
  const [filtered, setFiltered] = useState<Emprendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getEmprendedores();
      const data = response.data?.results ?? response.data ?? [];
      setEmprendedores(data);
      setFiltered(data);
    } catch (err) {
      setError('Error al cargar los emprendedores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      emprendedores.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.apellido.toLowerCase().includes(q) ||
          e.documento_identidad.includes(q)
      )
    );
  }, [search, emprendedores]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este emprendedor?')) {
      try {
        await deleteEmprendedor(id);
        fetchData();
      } catch {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2a3a' }}>
              Emprendedores
            </h1>
            {!loading && (
              <p className="text-sm mt-0.5" style={{ color: '#5a7a8a' }}>
                {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
              </p>
            )}
          </div>
          <Link href="/emprendedores/nuevo">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#8dc63f' }}
            >
              <Plus className="w-4 h-4" />
              Nuevo Emprendedor
            </button>
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5a7a8a' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none transition-all"
            onFocus={(e) => { e.target.style.borderColor = '#1a6fa0'; e.target.style.boxShadow = '0 0 0 2px rgba(26,111,160,0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
          />
        </div>

        {/* Estado cargando */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: '#1a6fa0', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#1a6fa0' }} />
            <p className="font-medium" style={{ color: '#5a7a8a' }}>
              {search ? 'Sin resultados para la búsqueda' : 'No hay emprendedores registrados'}
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((emp) => (
              <div
                key={emp.emprendedor_id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex items-center gap-4">

                  {/* Avatar con iniciales */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1a6fa0' }}
                  >
                    {getInitials(emp.nombre, emp.apellido)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base truncate" style={{ color: '#1a2a3a' }}>
                      {capitalize(emp.nombre)} {capitalize(emp.apellido)}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs" style={{ color: '#5a7a8a' }}>
                        DNI: <span className="font-medium text-slate-700">{emp.documento_identidad}</span>
                      </span>
                      <span className="text-xs" style={{ color: '#5a7a8a' }}>
                        {SEXO_LABEL[emp.sexo] ?? emp.sexo}
                      </span>
                      {emp.situacion_fiscal_nombre && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#e8f3fa', color: '#1a6fa0' }}
                        >
                          {emp.situacion_fiscal_nombre}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/emprendedores/${emp.emprendedor_id}`}>
                      <button
                        title="Ver detalle"
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href={`/emprendedores/${emp.emprendedor_id}/editar`}>
                      <button
                        title="Editar"
                        className="p-2 rounded-lg text-white transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#1a6fa0' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      title="Eliminar"
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      onClick={() => handleDelete(emp.emprendedor_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}