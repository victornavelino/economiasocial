'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createEmprendedor, getSituacionesFiscales, getMediosDePago } from '@/app/services/api';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User, MapPin, CreditCard, FileText } from 'lucide-react';

// ── Schema de validación ────────────────────────────────────────────────────
const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  documento_identidad: z
    .string()
    .min(7, 'Mínimo 7 caracteres')
    .max(12, 'Máximo 12 caracteres')
    .regex(/^\d+$/, 'Solo números'),
  cuit: z
    .string()
    .length(11, 'El CUIT debe tener exactamente 11 dígitos sin guiones')
    .regex(/^\d+$/, 'Solo números'),
  fecha_nacimiento: z.string().optional(),
  sexo: z.enum(['m', 'f', 'o']).optional(),
  email: z.string().email('Email inválido'),
  domicilio: z.string().optional(),
  localidad: z.string().optional(),
  medio_de_pago_id: z.coerce.number().min(1, 'Seleccione un medio de pago'),
  situacion_fiscal_id: z.coerce.number().min(1, 'Seleccione una situación fiscal'),
});

type FormData = z.infer<typeof schema>;

// ── Componentes auxiliares ──────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{message}</p>;
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-all outline-none
        ${error
          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
          : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-300'
        }`}
      {...props}
    />
  );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-all outline-none appearance-none bg-no-repeat cursor-pointer
        ${error
          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
          : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-300'
        }`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', paddingRight: '2.5rem' }}
      {...props}
    >
      {children}
    </select>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <div className="p-1.5 bg-blue-50 rounded-md">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function NuevoEmprendedor() {
  const router = useRouter();

  const [situaciones, setSituaciones] = useState<{ id: number; nombre: string }[]>([]);
  const [medios, setMedios] = useState<{ id: number; nombre: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sexo: 'm',
      medio_de_pago_id: 0,
      situacion_fiscal_id: 0,
    },
  });

  // Cargar selects desde la API
  useEffect(() => {
    Promise.all([getSituacionesFiscales(), getMediosDePago()])
      .then(([sfRes, mdpRes]) => {
        // Con renderer_classes = [JSONRenderer] la respuesta es JSON plano paginado:
        // { count, next, previous, results: [{id, nombre}, ...] }
        const sfData = sfRes.data?.results ?? sfRes.data?.data ?? sfRes.data ?? [];
        const mdpData = mdpRes.data?.results ?? mdpRes.data?.data ?? mdpRes.data ?? [];

        const normalize = (items: any[]) =>
          items.map((item) => ({
            id: Number(item.id),
            nombre: item.attributes?.nombre ?? item.nombre ?? '',
          }));

        setSituaciones(normalize(sfData));
        setMedios(normalize(mdpData));
      })
      .catch(() => {
        // Falla silenciosa; el usuario verá los selects vacíos
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      await createEmprendedor(data);
      router.push('/emprendedores');
      router.refresh();
    } catch (err: any) {
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        setSubmitError(messages);
      } else {
        setSubmitError('Ocurrió un error al guardar el emprendedor. Revisá los datos e intentá nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/emprendedores"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Emprendedores</p>
              <h1 className="text-xl font-bold text-slate-800">Nuevo Emprendedor</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-6">

            {/* ── Datos personales ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <SectionTitle icon={User} title="Datos personales" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre" required>Nombre</Label>
                  <Input id="nombre" {...register('nombre')} error={!!errors.nombre} placeholder="Juan" />
                  <FieldError message={errors.nombre?.message} />
                </div>

                <div>
                  <Label htmlFor="apellido" required>Apellido</Label>
                  <Input id="apellido" {...register('apellido')} error={!!errors.apellido} placeholder="Pérez" />
                  <FieldError message={errors.apellido?.message} />
                </div>

                <div>
                  <Label htmlFor="documento_identidad" required>DNI</Label>
                  <Input
                    id="documento_identidad"
                    {...register('documento_identidad')}
                    error={!!errors.documento_identidad}
                    placeholder="32628830"
                    inputMode="numeric"
                  />
                  <FieldError message={errors.documento_identidad?.message} />
                </div>

                <div>
                  <Label htmlFor="cuit" required>CUIT / CUIL</Label>
                  <Input
                    id="cuit"
                    {...register('cuit')}
                    error={!!errors.cuit}
                    placeholder="20326288307 (sin guiones)"
                    inputMode="numeric"
                  />
                  <FieldError message={errors.cuit?.message} />
                </div>

                <div>
                  <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                  <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} error={!!errors.fecha_nacimiento} />
                  <FieldError message={errors.fecha_nacimiento?.message} />
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select id="sexo" {...register('sexo')} error={!!errors.sexo}>
                    <option value="m">Masculino</option>
                    <option value="f">Femenino</option>
                    <option value="o">Otro</option>
                  </Select>
                  <FieldError message={errors.sexo?.message} />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="email" required>Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    placeholder="juan.perez@ejemplo.com"
                  />
                  <FieldError message={errors.email?.message} />
                </div>
              </div>
            </div>

            {/* ── Domicilio ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <SectionTitle icon={MapPin} title="Domicilio" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="domicilio">Dirección</Label>
                  <Input id="domicilio" {...register('domicilio')} placeholder="Av. Siempreviva 742" />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="localidad">Localidad</Label>
                  <Input id="localidad" {...register('localidad')} placeholder="San Fernando del Valle de Catamarca" />
                </div>
              </div>
            </div>

            {/* ── Datos fiscales ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <SectionTitle icon={FileText} title="Situación fiscal" />

              {loadingOptions ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando opciones...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="situacion_fiscal_id" required>Situación fiscal</Label>
                    <Select
                      id="situacion_fiscal_id"
                      {...register('situacion_fiscal_id')}
                      error={!!errors.situacion_fiscal_id}
                    >
                      <option value="0">— Seleccioná —</option>
                      {situaciones.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </Select>
                    <FieldError message={errors.situacion_fiscal_id?.message} />
                  </div>

                  <div>
                    <Label htmlFor="medio_de_pago_id" required>Medio de pago</Label>
                    <Select
                      id="medio_de_pago_id"
                      {...register('medio_de_pago_id')}
                      error={!!errors.medio_de_pago_id}
                    >
                      <option value="0">— Seleccioná —</option>
                      {medios.map((m) => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </Select>
                    <FieldError message={errors.medio_de_pago_id?.message} />
                  </div>
                </div>
              )}
            </div>

            {/* Error global del submit */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 whitespace-pre-line font-medium">{submitError}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2 pb-8">
              <Link href="/emprendedores">
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar emprendedor
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}