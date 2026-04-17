'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMediosDePago, deleteMedioDePago } from '@/app/services/api';
import { Edit, Trash2, Eye, Plus, CreditCard, Search } from 'lucide-react';

interface MedioDePago {
  id: number;
  nombre: string;
}

const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';

export default function MedioDePagoPage() {
  const [items, setItems] = useState<MedioDePago[]>([]);
  const [filtered, setFiltered] = useState<MedioDePago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMediosDePago();
      const data = res.data?.results ?? res.data ?? [];
      setItems(data);
      setFiltered(data);
    } catch {
      setError('Error al cargar los medios de pago');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter((i) => i.nombre.toLowerCase().includes(q)));
  }, [search, items]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este medio de pago?')) {
      try {
        await deleteMedioDePago(id);
        fetchData();
      } catch {
        alert('Error al eliminar. Puede que esté siendo usado por emprendedores.');
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2a3a' }}>
              Medios de Pago
            </h1>
            {!loading && (
              <p className="text-sm mt-0.5" style={{ color: '#5a7a8a' }}>
                {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
              </p>
            )}
          </div>
          <Link href="/mediodepago/nuevo">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#8dc63f' }}
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5a7a8a' }} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none transition-all"
            onFocus={(e) => { e.target.style.borderColor = PRIMARY; e.target.style.boxShadow = '0 0 0 2px rgba(26,111,160,0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
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
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: PRIMARY }} />
            <p className="font-medium" style={{ color: '#5a7a8a' }}>
              {search ? 'Sin resultados para la búsqueda' : 'No hay medios de pago registrados'}
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Icono */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: PRIMARY_LIGHT }}
                  >
                    <CreditCard className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate" style={{ color: '#1a2a3a' }}>
                      {item.nombre}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#5a7a8a' }}>ID: {item.id}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/mediodepago/${item.id}`}>
                      <button title="Ver detalle" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href={`/mediodepago/${item.id}/editar`}>
                      <button title="Editar" className="p-2 rounded-lg text-white transition-opacity hover:opacity-80" style={{ backgroundColor: PRIMARY }}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      title="Eliminar"
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      onClick={() => handleDelete(item.id)}
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
