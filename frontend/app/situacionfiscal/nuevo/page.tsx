'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSituacionFiscal } from '@/app/services/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const PRIMARY = '#1a6fa0';

export default function NuevaSituacionFiscalPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    if (!nombre.trim()) {
      setFieldError('El nombre es obligatorio');
      return;
    }

    setSubmitting(true);
    try {
      await createSituacionFiscal({ nombre: nombre.trim() });
      router.push('/situacionfiscal');
      router.refresh();
    } catch (err: any) {
      const apiErrors = err?.response?.data;
      if (apiErrors?.nombre) {
        setFieldError(Array.isArray(apiErrors.nombre) ? apiErrors.nombre.join(', ') : apiErrors.nombre);
      } else {
        setError('Error al guardar. Revisá los datos e intentá nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/situacionfiscal" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Situaciones Fiscales</p>
            <h1 className="text-xl font-bold text-slate-800">Nueva Situación Fiscal</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">

            <div>
              <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setFieldError(null); }}
                placeholder="Ej: Monotributista"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all
                  ${fieldError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                onFocus={(e) => { if (!fieldError) { e.target.style.borderColor = PRIMARY; e.target.style.boxShadow = '0 0 0 2px rgba(26,111,160,0.15)'; } }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
              {fieldError && <p className="mt-1 text-xs text-red-500 font-medium">{fieldError}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/situacionfiscal">
                <button type="button" className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" />Guardar</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
