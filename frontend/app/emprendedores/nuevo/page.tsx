'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import {
  createEmprendedor, getSituacionesFiscales, getMediosDePago,
  getRubros, getServicios, getLocalidades,
} from '@/app/services/api';
import Link from 'next/link';
import {
  ArrowLeft, Save, Loader2, User, MapPin, FileText,
  Briefcase, Plus, Trash2, Search, Check, Pencil, X,
  FileUp, Paperclip,
} from 'lucide-react';

// ── Schemas ────────────────────────────────────────────────────────────────
const documentoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del documento es obligatorio'),
  archivo: z.any().optional(),
});

const emprendimientoSchema = z.object({
  nombre_marca: z.string().min(1, 'El nombre de marca es obligatorio'),
  tipo_produccion: z.enum(['artesanal', 'semi_industrial', 'servicio']),
  nivel_emprendimiento: z.enum([
    'idea_inicial',
    'produccion_pequena_escala',
    'produccion_habilitada',
    'escalamiento_productivo',
    'comercializacion_exportacion',
  ]).default('idea_inicial'),
  rubro_id: z.any().transform(val => (val === "" || val === null ? null : Number(val))),
  servicio_id: z.any().transform(val => (val === "" || val === null ? null : Number(val))),
  descripcion: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
  documentos: z.array(documentoSchema).default([]),
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
  fecha_nacimiento: z.string().default(''),
  sexo: z.enum(['m', 'f', 'o']).default('m'),
  email: z.string().email('Email inválido'),
  domicilio: z.string().default(''),
  localidad: z.any().transform(val => (val === "" || val === null ? null : Number(val))),
  medio_de_pago_id: z.any().transform(val => Number(val)).refine(val => val > 0, { message: 'Debés seleccionar un medio de pago' }),
  situacion_fiscal_id: z.any().transform(val => Number(val)).refine(val => val > 0, { message: 'Debés seleccionar una situación fiscal' }),
  participa_mercado_itinerante: z.boolean().default(false),
  participa_ferias: z.boolean().default(false),
  numero_carnet: z.string().default(''),
  vencimiento_carnet: z.string().default(''),
  numero_habilitacion_bromatologica: z.string().default(''),
  vencimiento_habilitacion_bromatologica: z.string().default(''),
  emprendimientos: z.array(emprendimientoSchema).default([]),
});

type FormData = {
  nombre: string;
  apellido: string;
  documento_identidad: string;
  cuit: string;
  fecha_nacimiento: string;
  sexo: 'm' | 'f' | 'o';
  email: string;
  domicilio: string;
  localidad: number | null;
  medio_de_pago_id: number;
  situacion_fiscal_id: number;
  participa_mercado_itinerante: boolean;
  participa_ferias: boolean;
  numero_carnet: string;
  vencimiento_carnet: string;
  numero_habilitacion_bromatologica: string;
  vencimiento_habilitacion_bromatologica: string;
  emprendimientos: {
    nombre_marca: string;
    tipo_produccion: 'artesanal' | 'semi_industrial' | 'servicio';
    nivel_emprendimiento: 'idea_inicial' | 'produccion_pequena_escala' | 'produccion_habilitada' | 'escalamiento_productivo' | 'comercializacion_exportacion';
    rubro_id: number | null;
    servicio_id: number | null;
    documentos: {
      nombre: string;
      archivo?: File;
    }[];
  }[];
};


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

const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';
const ACCENT = '#8dc63f';

// ── Componentes auxiliares ──────────────────────────────────────────────────
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

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all resize-none
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      onFocus={e => { if (!error) { e.target.style.borderColor = PRIMARY; e.target.style.boxShadow = `0 0 0 2px rgba(26,111,160,0.15)`; } }}
      onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
      rows={3}
      {...props}
    />
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

// ── Combobox de localidad ──────────────────────────────────────────────────
type LocalidadOption = { id: number; nombre: string; parent_nombre: string | null };

function LocalidadCombobox({
  value, onChange, error,
}: {
  value: number | null | undefined;
  onChange: (id: number | null) => void;
  error?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<LocalidadOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LocalidadOption | null>(null);

  // Buscar con debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) { setOptions([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      getLocalidades(query)
        .then((res) => {
          const items = res.data?.results ?? res.data ?? [];
          setOptions(items);
          setOpen(true);
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Cargar nombre inicial si ya hay un id seleccionado
  useEffect(() => {
    if (value && !selected) {
      getLocalidades()
        .then((res) => {
          // No hay endpoint por id, buscamos en primeros resultados
          // Si no lo encontramos, dejamos vacío el label
        })
        .catch(() => { });
    }
    if (!value) { setSelected(null); setQuery(''); }
  }, [value]);

  const handleSelect = (opt: LocalidadOption) => {
    setSelected(opt);
    setQuery('');
    setOpen(false);
    onChange(opt.id);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setOpen(false);
    onChange(null);
  };

  return (
    <div className="relative">
      {selected ? (
        <div
          className={`w-full px-3 py-2.5 rounded-lg border text-sm flex items-center justify-between bg-white
            ${error ? 'border-red-300' : 'border-slate-200'}`}
        >
          <span className="text-slate-800">
            {selected.nombre}
            {selected.parent_nombre && (
              <span className="text-slate-400 ml-1 text-xs">({selected.parent_nombre})</span>
            )}
          </span>
          <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600 text-xs ml-2">
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className={`w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-all
              ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            placeholder="Buscar localidad..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value.trim().length < 2) setOpen(false); }}
            onFocus={() => { if (options.length > 0) setOpen(true); }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            style={{ borderColor: open ? PRIMARY : '', boxShadow: open ? `0 0 0 2px rgba(26,111,160,0.15)` : '' }}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
          )}
        </div>
      )}

      {open && options.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.id}
              onMouseDown={() => handleSelect(opt)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex justify-between items-center"
            >
              <span className="text-slate-800">{opt.nombre}</span>
              {opt.parent_nombre && (
                <span className="text-slate-400 text-xs">{opt.parent_nombre}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {open && !loading && query.length >= 2 && options.length === 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm text-slate-400">
          Sin resultados para "{query}"
        </div>
      )}
    </div>
  );
}

function DocumentosSection({ nestIndex, control, register, errors }: { nestIndex: number, control: any, register: any, errors: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `emprendimientos.${nestIndex}.documentos`
  });

  return (
    <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" />
          Documentos (Opcional)
        </label>
        <button
          type="button"
          onClick={() => append({ nombre: '', archivo: null })}
          className="text-[10px] font-bold text-[#1a6fa0] bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-[11px] text-slate-400 italic">No hay documentos adjuntos para este emprendimiento.</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="group flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 transition-all hover:border-slate-300">
            <div className="flex-[2]">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nombre del archivo</label>
              <Input
                placeholder="Ej: Constancia de Inscripción"
                {...register(`emprendimientos.${nestIndex}.documentos.${index}.nombre`)}
                className="bg-white"
              />
            </div>
            <div className="flex-[3]">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Archivo</label>
              <div className="relative">
                <input
                  type="file"
                  {...register(`emprendimientos.${nestIndex}.documentos.${index}.archivo`)}
                  className="w-full text-xs text-slate-500
                    file:mr-3 file:py-1.5 file:px-3
                    file:rounded-md file:border-0
                    file:text-[10px] file:font-bold
                    file:bg-slate-200 file:text-slate-700
                    hover:file:bg-slate-300 file:cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Eliminar documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function NuevoEmprendedor() {
  const router = useRouter();
  const { data: session } = useSession();
  const [situaciones, setSituaciones] = useState<{ id: number; nombre: string }[]>([]);
  const [medios, setMedios] = useState<{ id: number; nombre: string }[]>([]);
  const [rubros, setRubros] = useState<{ id: number; nombre: string }[]>([]);
  const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const isStaff = (session as any)?.isStaff;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sexo: 'm',
      medio_de_pago_id: 0,
      situacion_fiscal_id: 0,
      localidad: null,
      participa_mercado_itinerante: false,
      participa_ferias: false,
      numero_carnet: '',
      vencimiento_carnet: '',
      numero_habilitacion_bromatologica: '',
      vencimiento_habilitacion_bromatologica: '',
      emprendimientos: [],
    },
  });

  // Pre-llenado con datos OIDC — solo para ciudadanos, no para admin
  useEffect(() => {
    if (session?.userProfile && !(session as any).isStaff) {
      const prof = session.userProfile;
      reset((prev) => ({
        ...prev,
        nombre: prof.given_name || '',
        apellido: prof.family_name || '',
        email: prof.email || '',
        documento_identidad: prof.documento || '',
        cuit: prof.cuil || '',
        fecha_nacimiento: prof.birthdate || '',
        sexo: (prof.gender === 'm' || prof.gender === 'f' || prof.gender === 'o') ? prof.gender : 'm',
      }));
    }
  }, [session, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'emprendimientos' });

  useEffect(() => {
    Promise.all([getSituacionesFiscales(), getMediosDePago(), getRubros(), getServicios()])
      .then(([sfRes, mdpRes, rubroRes, servicioRes]) => {
        const normalize = (res: any) => {
          const items = res.data?.results ?? res.data ?? [];
          return items.map((item: any) => ({ id: Number(item.id), nombre: item.nombre ?? '' }));
        };
        setSituaciones(normalize(sfRes));
        setMedios(normalize(mdpRes));
        setRubros(normalize(rubroRes));
        setServicios(normalize(servicioRes));
      })
      .catch(() => { })
      .finally(() => setLoadingOptions(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const formData = new FormData();
      const payload = {
        ...data,
        numero_carnet: data.numero_carnet || null,
        vencimiento_carnet: data.vencimiento_carnet || null,
        numero_habilitacion_bromatologica: data.numero_habilitacion_bromatologica || null,
        vencimiento_habilitacion_bromatologica: data.vencimiento_habilitacion_bromatologica || null,
        emprendimientos: data.emprendimientos.map(emp => ({
          ...emp,
          documentos: emp.documentos.map(doc => ({ nombre: doc.nombre }))
        }))
      };
      formData.append('data', JSON.stringify(payload));

      data.emprendimientos.forEach((emp, empIdx) => {
        emp.documentos.forEach((doc, docIdx) => {
          if (doc.archivo && doc.archivo.length > 0) {
            formData.append(`file_${empIdx}_${docIdx}`, doc.archivo[0]);
          }
        });
      });

      await createEmprendedor(formData);
      if (isStaff) {
        router.push('/emprendedores');
        router.refresh();
      } else {
        setSuccessMessage('Datos almacenados correctamente.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => {
            if (field === 'emprendimientos' && Array.isArray(msgs)) {
              return msgs.map((item: any, i: number) => {
                if (typeof item === 'object' && Object.keys(item).length > 0) {
                  const details = Object.entries(item)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join(', ');
                  return `Emprendimiento #${i + 1}: ${details}`;
                }
                return null;
              }).filter(Boolean).join('\n');
            }
            return `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
          })
          .filter(Boolean)
          .join('\n');
        setSubmitError(messages || 'Error de validación en los datos.');
      } else {
        setSubmitError('Error al guardar. Revisá los datos e intentá nuevamente.');
      }
    }
  };

  const agregarEmprendimiento = () => {
    append({
      nombre_marca: '',
      tipo_produccion: 'artesanal',
      nivel_emprendimiento: 'idea_inicial',
      rubro_id: null,
      servicio_id: null,
      descripcion: '',
      documentos: [],
    });
    setEditingIndex(fields.length);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>

      {/* Header sticky */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 lg:static">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
          {isStaff && (
            <Link
              href="/emprendedores"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1 min-w-0 px-2">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium truncate">Emprendedores</p>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">Nuevo Emprendedor</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="p-1 rounded-full bg-green-500 text-white">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-sm text-green-700 font-bold">{successMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-6">

            {/* ── Datos personales ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
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
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
              <SectionTitle icon={MapPin} title="Domicilio" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="domicilio">Dirección</Label>
                  <Input id="domicilio" {...register('domicilio')} placeholder="Av. Siempreviva 742" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="localidad">Localidad</Label>
                  <Controller
                    control={control}
                    name="localidad"
                    render={({ field }) => (
                      <LocalidadCombobox
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.localidad}
                      />
                    )}
                  />
                  <FieldError message={errors.localidad?.message} />
                </div>
              </div>
            </div>

            {/* ── Situación fiscal ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
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

            {/* ── Participación y Alimentos ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
              <SectionTitle icon={FileText} title="Participación y Alimentos" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Checkboxes de participación */}
                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex-1">
                    <input
                      type="checkbox"
                      id="participa_mercado_itinerante"
                      {...register('participa_mercado_itinerante')}
                      className="w-4 h-4 rounded accent-[#1a6fa0] cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Mercado Itinerante</p>
                      <p className="text-xs text-slate-400">Participa en mercado itinerante</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex-1">
                    <input
                      type="checkbox"
                      id="participa_ferias"
                      {...register('participa_ferias')}
                      className="w-4 h-4 rounded accent-[#1a6fa0] cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Ferias</p>
                      <p className="text-xs text-slate-400">Participa en ferias</p>
                    </div>
                  </label>
                </div>

                {/* Datos de ManipulaAlimentos */}
                <div>
                  <Label htmlFor="numero_carnet">N° de Carnet</Label>
                  <Input id="numero_carnet" {...register('numero_carnet')} placeholder="Ej: C-12345" />
                </div>
                <div>
                  <Label htmlFor="vencimiento_carnet">Vencimiento Carnet</Label>
                  <Input id="vencimiento_carnet" type="date" {...register('vencimiento_carnet')} />
                </div>
                <div>
                  <Label htmlFor="numero_habilitacion_bromatologica">N° Hab. Bromatológica</Label>
                  <Input id="numero_habilitacion_bromatologica" {...register('numero_habilitacion_bromatologica')} placeholder="Ej: HB-98765" />
                </div>
                <div>
                  <Label htmlFor="vencimiento_habilitacion_bromatologica">Vencimiento Hab. Bromatológica</Label>
                  <Input id="vencimiento_habilitacion_bromatologica" type="date" {...register('vencimiento_habilitacion_bromatologica')} />
                </div>

              </div>
            </div>

            {/* ── Emprendimientos ── */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
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
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const isEditing = editingIndex === index;
                    const nombreMarca = (control as any)._formValues.emprendimientos?.[index]?.nombre_marca || 'Nuevo Emprendimiento';

                    return (
                      <div
                        key={field.id}
                        className={`rounded-xl border transition-all duration-200 ${isEditing ? 'border-amber-200 shadow-md ring-1 ring-amber-100 bg-white' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                      >
                        {/* Vista de Fila (Lista) */}
                        {!isEditing ? (
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm shrink-0">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-bold text-slate-700 truncate">{nombreMarca}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  #{index + 1} • Sin guardar
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingIndex(index)}
                                className="p-2 rounded-lg text-slate-400 hover:text-[#1a6fa0] hover:bg-white transition-all shadow-sm hover:shadow active:scale-95"
                                title="Editar detalles"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('¿Estás seguro de eliminar este emprendimiento?')) {
                                    remove(index);
                                  }
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm hover:shadow active:scale-95"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Vista de Formulario (Edición) */
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                  Editando emprendimiento #{index + 1}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-sm"
                              >
                                <Check className="w-3 h-3" />
                                Listo
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Nombre de marca */}
                              <div className="sm:col-span-2">
                                <Label htmlFor={`emprendimientos.${index}.nombre_marca`} required>Nombre / Marca</Label>
                                <Input
                                  id={`emprendimientos.${index}.nombre_marca`}
                                  {...register(`emprendimientos.${index}.nombre_marca`)}
                                  error={!!errors.emprendimientos?.[index]?.nombre_marca}
                                  placeholder="Ej: La Abuela Repostera"
                                />
                                <FieldError message={errors.emprendimientos?.[index]?.nombre_marca?.message} />
                              </div>

                              {/* Tipo de producción */}
                              <div>
                                <Label htmlFor={`emprendimientos.${index}.tipo_produccion`} required>Tipo de producción</Label>
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

                              {/* Descripción */}
                              <div className="sm:col-span-2">
                                <Label htmlFor={`emprendimientos.${index}.descripcion`}>Descripción del emprendimiento</Label>
                                <Textarea
                                  id={`emprendimientos.${index}.descripcion`}
                                  {...register(`emprendimientos.${index}.descripcion`)}
                                  error={!!errors.emprendimientos?.[index]?.descripcion}
                                  placeholder="Contanos brevemente de qué se trata, qué producís o qué servicios brindás..."
                                />
                                <FieldError message={errors.emprendimientos?.[index]?.descripcion?.message} />
                              </div>

                              {/* Nivel actual */}
                              <div>
                                <Label htmlFor={`emprendimientos.${index}.nivel_emprendimiento`}>Nivel actual</Label>
                                <Select
                                  id={`emprendimientos.${index}.nivel_emprendimiento`}
                                  {...register(`emprendimientos.${index}.nivel_emprendimiento`)}
                                >
                                  {NIVELES.map((n) => (
                                    <option key={n.value} value={n.value}>{n.label}</option>
                                  ))}
                                </Select>
                              </div>

                              {/* Rubro */}
                              <div>
                                <Label htmlFor={`emprendimientos.${index}.rubro_id`}>Rubro</Label>
                                <Select
                                  id={`emprendimientos.${index}.rubro_id`}
                                  {...register(`emprendimientos.${index}.rubro_id`)}
                                >
                                  <option value="">— Sin rubro —</option>
                                  {rubros.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                  ))}
                                </Select>
                              </div>

                              {/* Servicio */}
                              <div>
                                <Label htmlFor={`emprendimientos.${index}.servicio_id`}>Servicio</Label>
                                <Select
                                  id={`emprendimientos.${index}.servicio_id`}
                                  {...register(`emprendimientos.${index}.servicio_id`)}
                                >
                                  <option value="">— Sin servicio —</option>
                                  {servicios.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                  ))}
                                </Select>
                              </div>

                              {/* Documentos */}
                              <DocumentosSection
                                nestIndex={index}
                                control={control}
                                register={register}
                                errors={errors}
                              />
                            </div>

                            <div className="mt-6 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('¿Deseas eliminar este emprendimiento?')) {
                                    remove(index);
                                    setEditingIndex(null);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar este registro
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 pb-8">
              {isStaff && (
                <Link href="/emprendedores" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </Link>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-opacity hover:opacity-90"
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