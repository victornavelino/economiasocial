'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRubros, deleteRubro } from '@/app/services/api';
import { Edit, Trash2, Plus, Layers, Search, ChevronRight } from 'lucide-react';

interface Rubro {
  id: number;
  nombre: string;
  tipo: 'rubro' | 'subrubro';
  parent: number | null;
}

const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';
const ACCENT = '#8dc63f';

export default function RubroPage() {
  const [items, setItems] = useState<Rubro[]>([]);
  const [filtered, setFiltered] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getRubros();
      const data = res.data?.results ?? res.data ?? [];
      setItems(data);
      setFiltered(data);
    } catch {
      setError('Error al cargar los rubros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter((i) => 
      i.nombre.toLowerCase().includes(q) || 
      i.tipo.toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este rubro?')) {
      try {
        await deleteRubro(id);
        fetchData();
      } catch {
        alert('Error al eliminar. Puede que esté siendo usado por emprendimientos.');
      }
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    return items.find(i => i.id === parentId)?.nombre;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Rubros y Subrubros
            </h1>
            {!loading && (
              <p className="text-sm text-slate-500 mt-0.5">
                {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
              </p>
            )}
          </div>
          <Link href="/rubro/nuevo">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              <Plus className="w-4 h-4" />
              Nuevo Rubro
            </button>
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
        )}

        {/* Vacío */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="font-medium text-slate-500">
              {search ? 'Sin resultados para la búsqueda' : 'No hay rubros registrados'}
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.tipo === 'rubro' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.tipo}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">ID: {item.id}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/rubro/${item.id}/editar`}>
                        <button title="Editar" className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                      {item.nombre}
                    </h3>
                    {item.parent && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="font-medium">{getParentName(item.parent) || 'Cargando...'}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{item.nombre}</span>
                      </div>
                    )}
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
