'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createEmprendedor, getSituacionesFiscales, getMediosDePago, getRubros } from '@/app/services/api';
import Link from 'next/link';
import {
  ArrowLeft, Save, Loader2, User, MapPin, FileText,
  Briefcase, Plus, Trash2,
} from 'lucide-react';

// ── Schemas ────────────────────────────────────────────────────────────────
const emprendimientoSchema = z.object({
  nombre_marca: z.string().min(1, 'El nombre de marca es obligatorio'),
  tipo_produccion: z.enum(['artesanal', 'semi_industrial', 'servicio'], {
    errorMap: () => ({ message: 'Seleccione un tipo' }),
  }),
  nivel_emprendimiento: z.enum([
    'idea_inicial',
    'produccion_pequena_escala',
    'produccion_habilitada',
    'escalamiento_productivo',
    'comercializacion_exportacion',
  ]).default('idea_inicial'),
});

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  documento_identidad: z
    .string().min(7, 'Mínimo 7 caracteres').max(12, 'Máximo 12 caracteres')
    .regex(/^\d+$/, 'Solo números'),
  cuit: z
    .string().length(11, 'Debe tener 11 dígitos sin guiones')
    .regex(/^\d+$/, 'Solo números'),
  fecha_nacimiento: z.string().optional(),
  sexo: z.enum(['m', 'f', 'o']).optional(),
  email: z.string().email('Email inválido'),
  domicilio: z.string().optional(),
  localidad: z.string().optional(),
  medio_de_pago_id: z.coerce.number().min(1, 'Seleccione un medio de pago'),
  situacion_fiscal_id: z.coerce.number().min(1, 'Seleccione una situación fiscal'),
  emprendimientos: z.array(emprendimientoSchema).optional(),
});

type FormData = z.infer<typeof schema>;

// ── Constantes ─────────────────────────────────────────────────────────────
const TIPOS_PRODUCCION = [
  { value: 'artesanal', label: 'Artesanal' },
  { value: 'semi_industrial', label: 'Semi Industrial' },
  { value: 'servicio', label: 'Servicio' },
];

const NIVELES = [
  { value: 'idea_inicial', label: 'Idea Inicial' },
  { value: 'produccion_pequena_escala', label: 'Producción Pequeña Escala' },
  { value: 'produccion_habilitada', label: 'Producción Habilitada / Formalizada' },
  { value: 'escalamiento_productivo', label: 'Escalamiento Productivo' },
  { value: 'comercializacion_exportacion', label: 'Comercialización / Exportación' },
];

// ── Componentes auxiliares ──────────────────────────────────────────────────
const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';
const ACCENT = '#8dc63f';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{message}</p>;
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      onFocus={e => { if (!error) { e.target.style.borderColor = PRIMARY; e.target.style.boxShadow = `0 0 0 2px rgba(26,111,160,0.15)`; } }}
      onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
      {...props}
    />
  );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none cursor-pointer transition-all
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      onFocus={e => { if (!error) { e.target.style.borderColor = PRIMARY; e.target.style.boxShadow = `0 0 0 2px rgba(26,111,160,0.15)`; } }}
      onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
      {...props}
    >
      {children}
    </select>
  );
}

function SectionTitle({ icon: Icon, title, accent = false }: { icon: React.ElementType; title: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <div className="p-1.5 rounded-md" style={{ backgroundColor: accent ? '#f0f9e6' : PRIMARY_LIGHT }}>
        <Icon className="w-4 h-4" style={{ color: accent ? ACCENT : PRIMARY }} />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: accent ? ACCENT : PRIMARY }}>
        {title}
      </h2>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function NuevoEmprendedor() {
  const router = useRouter();
  const [situaciones, setSituaciones] = useState<{ id: number; nombre: string }[]>([]);
  const [medios, setMedios] = useState<{ id: number; nombre: string }[]>([]);
  const [rubros, setRubros = useState<{ id: number; nombre: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sexo: 'm',
      medio_de_pago_id: 0,
      situacion_fiscal_id: 0,
      emprendimientos: [],
    },
  });

  // Campo array para emprendimientos
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emprendimientos',
  });

  useEffect(() => {
    Promise.all([getSituacionesFiscales(), getMediosDePago()])
      .then(([sfRes, mdpRes]) => {
        const sfData = sfRes.data?.results ?? sfRes.data ?? [];
        const mdpData = mdpRes.data?.results ?? mdpRes.data ?? [];
        const normalize = (items: any[]) =>
          items.map((item) => ({ id: Number(item.id), nombre: item.nombre ?? '' }));
        setSituaciones(normalize(sfData));
        setMedios(normalize(mdpData));
      })
      .catch(() => { })
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
        setSubmitError('Error al guardar. Revisá los datos e intentá nuevamente.');
      }
    }
  };

  const agregarEmprendimiento = () => {
    append({ nombre_marca: '', tipo_produccion: 'artesanal', nivel_emprendimiento: 'idea_inicial' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>

      {/* Header sticky */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
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
                  <Input id="documento_identidad" {...register('documento_identidad')} error={!!errors.documento_identidad} placeholder="32628830" inputMode="numeric" />
                  <FieldError message={errors.documento_identidad?.message} />
                </div>
                <div>
                  <Label htmlFor="cuit" required>CUIT / CUIL</Label>
                  <Input id="cuit" {...register('cuit')} error={!!errors.cuit} placeholder="20326288307" inputMode="numeric" />
                  <FieldError message={errors.cuit?.message} />
                </div>
                <div>
                  <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                  <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select id="sexo" {...register('sexo')}>
                    <option value="m">Masculino</option>
                    <option value="f">Femenino</option>
                    <option value="o">Otro</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email" required>Correo electrónico</Label>
                  <Input id="email" type="email" {...register('email')} error={!!errors.email} placeholder="juan@ejemplo.com" />
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

            {/* ── Situación fiscal ── */}
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
                    <Select id="situacion_fiscal_id" {...register('situacion_fiscal_id')} error={!!errors.situacion_fiscal_id}>
                      <option value="0">— Seleccioná —</option>
                      {situaciones.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </Select>
                    <FieldError message={errors.situacion_fiscal_id?.message} />
                  </div>
                  <div>
                    <Label htmlFor="medio_de_pago_id" required>Medio de pago</Label>
                    <Select id="medio_de_pago_id" {...register('medio_de_pago_id')} error={!!errors.medio_de_pago_id}>
                      <option value="0">— Seleccioná —</option>
                      {medios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </Select>
                    <FieldError message={errors.medio_de_pago_id?.message} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Emprendimientos ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md" style={{ backgroundColor: '#f0f9e6' }}>
                    <Briefcase className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
                    Emprendimientos
                  </h2>
                  {fields.length > 0 && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#f0f9e6', color: ACCENT }}
                    >
                      {fields.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={agregarEmprendimiento}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 rounded-lg border-2 border-dashed border-slate-200">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-25" style={{ color: ACCENT }} />
                  <p className="text-sm text-slate-400">No hay emprendimientos agregados</p>
                  <button
                    type="button"
                    onClick={agregarEmprendimiento}
                    className="mt-3 text-xs font-semibold underline"
                    style={{ color: ACCENT }}
                  >
                    Agregar el primero
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-slate-200 p-4"
                      style={{ backgroundColor: '#fafbfc' }}
                    >
                      {/* Header de cada emprendimiento */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: PRIMARY_LIGHT, color: PRIMARY }}
                        >
                          Emprendimiento #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Nombre de marca */}
                        <div className="sm:col-span-2">
                          <Label htmlFor={`emprendimientos.${index}.nombre_marca`} required>
                            Nombre / Marca
                          </Label>
                          <Input
                            id={`emprendimientos.${index}.nombre_marca`}
                            {...register(`emprendimientos.${index}.nombre_marca`)}
                            error={!!errors.emprendimientos?.[index]?.nombre_marca}
                            placeholder="Ej: La Abuela Repostera"
                          />
                          <FieldError message={errors.emprendimientos?.[index]?.nombre_marca?.message} />
                        </div>
                        <div>
                          <Label htmlFor="rubro_id" required>Rubro</Label>
                          <Select id="rubro_id" {...register('rubro_id')} error={!!errors.rubro_id}>
                            <option value="0">— Seleccioná —</option>
                            {rubros.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                          </Select>
                          <FieldError message={errors.situacion_fiscal_id?.message} />
                        </div>

                        {/* Tipo de producción */}
                        <div>
                          <Label htmlFor={`emprendimientos.${index}.tipo_produccion`} required>
                            Tipo de producción
                          </Label>
                          <Select
                            id={`emprendimientos.${index}.tipo_produccion`}
                            {...register(`emprendimientos.${index}.tipo_produccion`)}
                            error={!!errors.emprendimientos?.[index]?.tipo_produccion}
                          >
                            {TIPOS_PRODUCCION.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </Select>
                          <FieldError message={errors.emprendimientos?.[index]?.tipo_produccion?.message} />
                        </div>

                        {/* Nivel */}
                        <div>
                          <Label htmlFor={`emprendimientos.${index}.nivel_emprendimiento`}>
                            Nivel actual
                          </Label>
                          <Select
                            id={`emprendimientos.${index}.nivel_emprendimiento`}
                            {...register(`emprendimientos.${index}.nivel_emprendimiento`)}
                          >
                            {NIVELES.map((n) => (
                              <option key={n.value} value={n.value}>{n.label}</option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error global */}
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" />Guardar emprendedor</>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}