'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emprendedorSchema, EmprendedorFormData } from '@/app/lib/validations';
import { createEmprendedor } from '@/app/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function NuevoEmprendedor() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmprendedorFormData>({
    resolver: zodResolver(emprendedorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      documento_identidad: '',
      fecha_nacimiento: '',
      nacionalidad: '',
      domicilio: '',
      localidad: '',
      sexo: 'm',
      email: '',
      cuit: '',
      medio_de_pago_id: 0,
      situacion_fiscal_id: 0,
    },
  });

  const onSubmit = async (data: EmprendedorFormData) => {
    try {
      await createEmprendedor(data);
      router.push('/emprendedores');
      router.refresh();
    } catch (error) {
      alert('Error al crear el emprendedor');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nuevo Emprendedor</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input {...register('nombre')} className="w-full border rounded-md p-2" />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <input {...register('apellido')} className="w-full border rounded-md p-2" />
            {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>}
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-medium mb-1">Documento de identidad</label>
            <input {...register('documento_identidad')} className="w-full border rounded-md p-2" />
            {errors.documento_identidad && <p className="text-red-500 text-sm mt-1">{errors.documento_identidad.message}</p>}
          </div>

          {/* CUIT */}
          <div>
            <label className="block text-sm font-medium mb-1">CUIT</label>
            <input {...register('cuit')} className="w-full border rounded-md p-2" placeholder="11 dígitos sin guiones" />
            {errors.cuit && <p className="text-red-500 text-sm mt-1">{errors.cuit.message}</p>}
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
            <input type="date" {...register('fecha_nacimiento')} className="w-full border rounded-md p-2" />
            {errors.fecha_nacimiento && <p className="text-red-500 text-sm mt-1">{errors.fecha_nacimiento.message}</p>}
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium mb-1">Sexo</label>
            <select {...register('sexo')} className="w-full border rounded-md p-2">
              <option value="m">Masculino</option>
              <option value="f">Femenino</option>
            </select>
            {errors.sexo && <p className="text-red-500 text-sm mt-1">{errors.sexo.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full border rounded-md p-2" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Nacionalidad */}
          <div>
            <label className="block text-sm font-medium mb-1">Nacionalidad</label>
            <input {...register('nacionalidad')} className="w-full border rounded-md p-2" />
            {errors.nacionalidad && <p className="text-red-500 text-sm mt-1">{errors.nacionalidad.message}</p>}
          </div>

          {/* Domicilio */}
          <div>
            <label className="block text-sm font-medium mb-1">Domicilio</label>
            <input {...register('domicilio')} className="w-full border rounded-md p-2" />
            {errors.domicilio && <p className="text-red-500 text-sm mt-1">{errors.domicilio.message}</p>}
          </div>

          {/* Localidad */}
          <div>
            <label className="block text-sm font-medium mb-1">Localidad</label>
            <input {...register('localidad')} className="w-full border rounded-md p-2" />
            {errors.localidad && <p className="text-red-500 text-sm mt-1">{errors.localidad.message}</p>}
          </div>

          {/* Medio de pago — idealmente un select cargado desde la API */}
          <div>
            <label className="block text-sm font-medium mb-1">Medio de pago (ID)</label>
            <input type="number" {...register('medio_de_pago_id')} className="w-full border rounded-md p-2" />
            {errors.medio_de_pago_id && <p className="text-red-500 text-sm mt-1">{errors.medio_de_pago_id.message}</p>}
          </div>

          {/* Situación fiscal — idealmente un select cargado desde la API */}
          <div>
            <label className="block text-sm font-medium mb-1">Situación fiscal (ID)</label>
            <input type="number" {...register('situacion_fiscal_id')} className="w-full border rounded-md p-2" />
            {errors.situacion_fiscal_id && <p className="text-red-500 text-sm mt-1">{errors.situacion_fiscal_id.message}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link href="/emprendedores">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}