'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMedioDePago } from '@/app/services/api';
import { ArrowLeft, Edit, CreditCard, Loader2 } from 'lucide-react';

const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';

export default function MedioDePagoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<{ id: number; nombre: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMedioDePago(Number(id))
      .then((res) => setItem(res.data))
      .catch(() => setError('No se pudo cargar el medio de pago'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/mediodepago" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Medios de Pago</p>
            <h1 className="text-xl font-bold text-slate-800">Detalle</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && item && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Encabezado de tarjeta */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: PRIMARY_LIGHT }}
              >
                <CreditCard className="w-7 h-7" style={{ color: PRIMARY }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#1a2a3a' }}>{item.nombre}</h2>
                <p className="text-sm mt-0.5" style={{ color: '#5a7a8a' }}>ID: {item.id}</p>
              </div>
            </div>

            {/* Datos */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nombre</p>
                <p className="text-base font-medium text-slate-800">{item.nombre}</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <Link href="/mediodepago">
                <button className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Volver
                </button>
              </Link>
              <Link href={`/mediodepago/${item.id}/editar`}>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
