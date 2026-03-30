'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    getEmprendedor, updateEmprendedor,
    getSituacionesFiscales, getMediosDePago,
    getRubros, getServicios, getLocalidades,
} from '@/app/services/api';
import Link from 'next/link';
import {
    ArrowLeft, Save, Loader2, User, MapPin, FileText,
    Briefcase, Plus, Trash2, AlertCircle, Search,
} from 'lucide-react';

// ── Schemas ────────────────────────────────────────────────────────────────
const emprendimientoSchema = z.object({
    id: z.number().optional(),
    nombre_marca: z.string().min(1, 'El nombre de marca es obligatorio'),
    tipo_produccion: z.enum(['artesanal', 'semi_industrial', 'servicio'], {
        errorMap: () => ({ message: 'Seleccioná un tipo' }),
    }),
    nivel_emprendimiento: z.enum([
        'idea_inicial',
        'produccion_pequena_escala',
        'produccion_habilitada',
        'escalamiento_productivo',
        'comercializacion_exportacion',
    ]).default('idea_inicial'),
    rubro_id: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable()),
    servicio_id: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable()),
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
    fecha_nacimiento: z.string().nullable().default(''),
    sexo: z.enum(['m', 'f', 'o']).nullable().default('m'),
    email: z.string().email('Email inválido'),
    domicilio: z.string().nullable().default(''),
    localidad: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().nullable()).default(null),
    medio_de_pago_id: z.preprocess((val) => Number(val), z.number().min(1, 'Seleccioná un medio de pago')),
    situacion_fiscal_id: z.preprocess((val) => Number(val), z.number().min(1, 'Seleccioná una situación fiscal')),
    emprendimientos: z.array(emprendimientoSchema).default([]),
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

const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';
const ACCENT = '#8dc63f';

// ── Componentes auxiliares ──────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-500 font-medium">{message}</p>;
}

function Label({
    htmlFor, children, required,
}: {
    htmlFor: string; children: React.ReactNode; required?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
        >
            {children}
            {required && <span className="text-red-400 ml-1">*</span>}
        </label>
    );
}

function Input({
    error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
    return (
        <input
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all
        ${error
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'}`}
            onFocus={e => {
                if (!error) {
                    e.target.style.borderColor = PRIMARY;
                    e.target.style.boxShadow = `0 0 0 2px rgba(26,111,160,0.15)`;
                }
            }}
            onBlur={e => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }}
            {...props}
        />
    );
}

function Select({
    error, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
    return (
        <select
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none cursor-pointer transition-all
        ${error
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'}`}
            onFocus={e => {
                if (!error) {
                    e.target.style.borderColor = PRIMARY;
                    e.target.style.boxShadow = `0 0 0 2px rgba(26,111,160,0.15)`;
                }
            }}
            onBlur={e => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }}
            {...props}
        >
            {children}
        </select>
    );
}

function SectionTitle({
    icon: Icon, title, accent = false,
}: {
    icon: React.ElementType; title: string; accent?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: accent ? '#f0f9e6' : PRIMARY_LIGHT }}
            >
                <Icon className="w-4 h-4" style={{ color: accent ? ACCENT : PRIMARY }} />
            </div>
            <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: accent ? ACCENT : PRIMARY }}
            >
                {title}
            </h2>
        </div>
    );
}

// ── Combobox de localidad ──────────────────────────────────────────────────
type LocalidadOption = { id: number; nombre: string; parent_nombre: string | null };

function LocalidadCombobox({
    value, onChange, initialNombre, error,
}: {
    value: number | null | undefined;
    onChange: (id: number | null) => void;
    initialNombre?: string | null;
    error?: boolean;
}) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<LocalidadOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<LocalidadOption | null>(
        value && initialNombre ? { id: value, nombre: initialNombre, parent_nombre: null } : null
    );

    // Si llega un valor inicial después de montar el componente
    useEffect(() => {
        if (value && initialNombre && !selected) {
            setSelected({ id: value, nombre: initialNombre, parent_nombre: null });
        }
        if (!value) {
            setSelected(null);
            setQuery('');
        }
    }, [value, initialNombre]);

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

// ── Página principal ────────────────────────────────────────────────────────
export default function EditarEmprendedor() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [loadingData, setLoadingData] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [initialLocalidadNombre, setInitialLocalidadNombre] = useState<string | null>(null);

    const [situaciones, setSituaciones] = useState<{ id: number; nombre: string }[]>([]);
    const [medios, setMedios] = useState<{ id: number; nombre: string }[]>([]);
    const [rubros, setRubros] = useState<{ id: number; nombre: string }[]>([]);
    const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>([]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            sexo: 'm',
            medio_de_pago_id: 0,
            situacion_fiscal_id: 0,
            localidad: null,
            emprendimientos: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'emprendimientos',
    });

    // Cargar opciones de selects
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

    // Cargar datos del emprendedor y poblar el formulario
    useEffect(() => {
        if (!id) return;

        setLoadingData(true);
        getEmprendedor(id)
            .then((res) => {
                const d = res.data;
                // Guardamos el nombre de la localidad para precargarlo en el combobox
                setInitialLocalidadNombre(d.localidad_nombre ?? d.localidad ?? null);

                reset({
                    nombre: d.nombre ?? '',
                    apellido: d.apellido ?? '',
                    documento_identidad: d.documento_identidad ?? '',
                    cuit: d.cuit ?? '',
                    fecha_nacimiento: d.fecha_nacimiento ?? '',
                    sexo: d.sexo ?? 'm',
                    email: d.email ?? '',
                    domicilio: d.domicilio ?? '',
                    localidad: d.localidad_id ?? null,
                    medio_de_pago_id: d.medio_de_pago_id ?? 0,
                    situacion_fiscal_id: d.situacion_fiscal_id ?? 0,
                    emprendimientos: (d.emprendimientos ?? []).map((emp: any) => ({
                        id: emp.id,
                        nombre_marca: emp.nombre_marca ?? '',
                        tipo_produccion: emp.tipo_produccion ?? 'artesanal',
                        nivel_emprendimiento: emp.nivel_emprendimiento ?? 'idea_inicial',
                        rubro_id: emp.rubro ?? null,
                        servicio_id: emp.servicio ?? null,
                    })),
                });
            })
            .catch(() => setFetchError('No se pudo cargar el emprendedor. Verificá que el ID sea correcto.'))
            .finally(() => setLoadingData(false));
    }, [id, reset]);


    const agregarEmprendimiento = () => {
        append({
            nombre_marca: '',
            tipo_produccion: 'artesanal',
            nivel_emprendimiento: 'idea_inicial',
            rubro_id: null,
            servicio_id: null,
        });
    };

    // ── Estados de carga / error ────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f8fb' }}>
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full border-2 animate-spin"
                        style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }}
                    />
                    <p className="text-sm font-medium text-slate-500">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f4f8fb' }}>
                <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center shadow-sm">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Error al cargar</h2>
                    <p className="text-sm text-slate-500 mb-6">{fetchError}</p>
                    <Link
                        href="/emprendedores"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: PRIMARY }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al listado
                    </Link>
                </div>
            </div>
        );
    }

    // ── Formulario ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f4f8fb' }}>

            {/* Header sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link
                        href={`/emprendedores/${id}`}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                            Emprendedores / Editar
                        </p>
                        <h1 className="text-xl font-bold text-slate-800 truncate">
                            Editando emprendedor #{id}
                        </h1>
                    </div>
                    {isDirty && (
                        <span
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: '#fff8e6', color: '#b45309' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sin guardar
                        </span>
                    )}
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
                                    <Input
                                        id="nombre"
                                        {...register('nombre')}
                                        error={!!errors.nombre}
                                        placeholder="Juan"
                                    />
                                    <FieldError message={errors.nombre?.message} />
                                </div>
                                <div>
                                    <Label htmlFor="apellido" required>Apellido</Label>
                                    <Input
                                        id="apellido"
                                        {...register('apellido')}
                                        error={!!errors.apellido}
                                        placeholder="Pérez"
                                    />
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
                                        placeholder="20326288307"
                                        inputMode="numeric"
                                    />
                                    <FieldError message={errors.cuit?.message} />
                                </div>
                                <div>
                                    <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                                    <Input
                                        id="fecha_nacimiento"
                                        type="date"
                                        {...register('fecha_nacimiento')}
                                    />
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
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        error={!!errors.email}
                                        placeholder="juan@ejemplo.com"
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
                                    <Input
                                        id="domicilio"
                                        {...register('domicilio')}
                                        placeholder="Av. Siempreviva 742"
                                    />
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
                                                initialNombre={initialLocalidadNombre}
                                                error={!!errors.localidad}
                                            />
                                        )}
                                    />
                                    <FieldError message={errors.localidad?.message} />
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

                        {/* ── Emprendimientos ── */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md" style={{ backgroundColor: '#f0f9e6' }}>
                                        <Briefcase className="w-4 h-4" style={{ color: ACCENT }} />
                                    </div>
                                    <h2
                                        className="text-sm font-bold uppercase tracking-wider"
                                        style={{ color: ACCENT }}
                                    >
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
                                    <Briefcase
                                        className="w-8 h-8 mx-auto mb-2 opacity-25"
                                        style={{ color: ACCENT }}
                                    />
                                    <p className="text-sm text-slate-400">
                                        No hay emprendimientos asociados
                                    </p>
                                    <button
                                        type="button"
                                        onClick={agregarEmprendimiento}
                                        className="mt-3 text-xs font-semibold underline"
                                        style={{ color: ACCENT }}
                                    >
                                        Agregar uno nuevo
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
                                                    {field.id && (
                                                        <span className="ml-1 opacity-50 font-normal normal-case">
                                                            (existente)
                                                        </span>
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    title="Quitar emprendimiento"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                                {/* Nombre de marca */}
                                                <div className="sm:col-span-2">
                                                    <Label
                                                        htmlFor={`emprendimientos.${index}.nombre_marca`}
                                                        required
                                                    >
                                                        Nombre / Marca
                                                    </Label>
                                                    <Input
                                                        id={`emprendimientos.${index}.nombre_marca`}
                                                        {...register(`emprendimientos.${index}.nombre_marca`)}
                                                        error={!!errors.emprendimientos?.[index]?.nombre_marca}
                                                        placeholder="Ej: La Abuela Repostera"
                                                    />
                                                    <FieldError
                                                        message={errors.emprendimientos?.[index]?.nombre_marca?.message}
                                                    />
                                                </div>

                                                {/* Tipo de producción */}
                                                <div>
                                                    <Label
                                                        htmlFor={`emprendimientos.${index}.tipo_produccion`}
                                                        required
                                                    >
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
                                                    <FieldError
                                                        message={errors.emprendimientos?.[index]?.tipo_produccion?.message}
                                                    />
                                                </div>

                                                {/* Nivel actual */}
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

                                                {/* Rubro */}
                                                <div>
                                                    <Label htmlFor={`emprendimientos.${index}.rubro_id`}>
                                                        Rubro
                                                    </Label>
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
                                                    <Label htmlFor={`emprendimientos.${index}.servicio_id`}>
                                                        Servicio
                                                    </Label>
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

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error global */}
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 whitespace-pre-line font-medium">
                                    {submitError}
                                </p>
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="flex justify-end gap-3 pt-2 pb-8">
                            <Link href={`/emprendedores/${id}`}>
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </Link>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}