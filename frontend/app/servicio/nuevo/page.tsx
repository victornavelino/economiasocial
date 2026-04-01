'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createServicio, getServicios } from '@/app/services/api';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Scissors } from 'lucide-react';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  tipo: z.enum(['servicio', 'subservicio']),
  parent: z.union([z.number(), z.null()]).optional(),
});

type FormData = z.infer<typeof schema>;

const PRIMARY = '#1a6fa0';

export default function NuevoServicio() {
  const router = useRouter();
  const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      tipo: 'servicio',
      parent: null,
    },
  });

  const tipo = watch('tipo');

  useEffect(() => {
    getServicios()
      .then((res) => {
        const data = res.data?.results ?? res.data ?? [];
        setServicios(data.filter((s: any) => s.tipo === 'servicio'));
      })
      .catch(() => { })
      .finally(() => setLoadingOptions(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const formattedData = {
        ...data,
        parent: data.parent || null
      };
      await createServicio(formattedData);
      router.push('/servicio');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        setSubmitError(messages);
      } else {
        setSubmitError('Error al guardar. Revisá los datos e intentá nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/servicio" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Servicios</p>
            <h1 className="text-xl font-bold text-slate-800">Nuevo Servicio</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <div className="p-1.5 rounded-md bg-indigo-50">
                <Scissors className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Datos del Servicio
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nombre
                </label>
                <input
                  {...register('nombre')}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-sky-500'
                  }`}
                  placeholder="Ej: Peluquería"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tipo
                </label>
                <select
                  {...register('tipo')}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none transition-all focus:border-sky-500"
                >
                  <option value="servicio">Servicio</option>
                  <option value="subservicio">Subservicio</option>
                </select>
              </div>

              {tipo === 'subservicio' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Servicio Padre
                  </label>
                  <select
                    {...register('parent')}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none transition-all focus:border-sky-500"
                  >
                    <option value="">— Seleccioná el padre —</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/servicio">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: PRIMARY }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-4 h-4" /> Guardar Servicio</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
