'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmprendimientos } from '@/app/services/api';
import { Eye, Rocket, Search, User, Briefcase } from 'lucide-react';

interface Emprendimiento {
  id: number;
  nombre_marca: string;
  tipo_produccion: string;
  nivel_emprendimiento: string;
  rubro_nombre: string;
  emprendedor_nombre: string;
}

const TIPO_PRODUCCION_LABEL: Record<string, string> = {
  artesanal: 'Artesanal',
  semi_industrial: 'Semi Industrial',
  servicio: 'Servicio',
};

const NIVEL_LABEL: Record<string, string> = {
  idea_inicial: 'Idea Inicial',
  produccion_pequena_escala: 'Producción Pequeña Escala',
  produccion_habilitada: 'Producción Habilitada',
  escalamiento_productivo: 'Escalamiento Productivo',
  comercializacion_exportacion: 'Comercialización/Exportación',
};

function capitalize(str: string) {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function EmprendimientosPage() {
  const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([]);
  const [filtered, setFiltered] = useState<Emprendimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getEmprendimientos();
      const data = response.data?.results ?? response.data ?? [];
      setEmprendimientos(data);
      setFiltered(data);
    } catch (err) {
      setError('Error al cargar los emprendimientos');
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
      emprendimientos.filter(
        (e) =>
          e.nombre_marca.toLowerCase().includes(q) ||
          (e.rubro_nombre && e.rubro_nombre.toLowerCase().includes(q)) ||
          e.emprendedor_nombre.toLowerCase().includes(q)
      )
    );
  }, [search, emprendimientos]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2a3a' }}>
              Emprendimientos
            </h1>
            {!loading && (
              <p className="text-sm mt-0.5" style={{ color: '#5a7a8a' }}>
                {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
              </p>
            )}
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5a7a8a' }} />
          <input
            type="text"
            placeholder="Buscar por marca, rubro o emprendedor..."
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
            <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#1a6fa0' }} />
            <p className="font-medium" style={{ color: '#5a7a8a' }}>
              {search ? 'Sin resultados para la búsqueda' : 'No hay emprendimientos registrados'}
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex items-center gap-4">

                  {/* Icono */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: '#8dc63f' }}
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base truncate" style={{ color: '#1a2a3a' }}>
                      {capitalize(emp.nombre_marca)}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#5a7a8a' }}>
                        <User className="w-3 h-3" />
                        <span className="font-medium text-slate-700">{emp.emprendedor_nombre}</span>
                      </span>
                      {emp.rubro_nombre && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#e8f3fa', color: '#1a6fa0' }}
                        >
                          {emp.rubro_nombre}
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {TIPO_PRODUCCION_LABEL[emp.tipo_produccion] ?? emp.tipo_produccion}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/emprendimiento/${emp.id}`}>
                      <button
                        title="Ver detalle"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </Link>
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
