'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emprendedorSchema } from '@/app/lib/validations';
import { createEmprendedor } from '@/app/services/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function NuevoEmprendedor() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(emprendedorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cuil: '',
    },
  });

  const onSubmit = async (data) => {
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
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              {...register('nombre')}
              className="w-full border rounded-md p-2"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <input
              {...register('apellido')}
              className="w-full border rounded-md p-2"
            />
            {errors.apellido && (
              <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full border rounded-md p-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              {...register('telefono')}
              className="w-full border rounded-md p-2"
            />
            {errors.telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CUIL</label>
            <input
              {...register('cuil')}
              className="w-full border rounded-md p-2"
              placeholder="11 dígitos sin guiones"
            />
            {errors.cuil && (
              <p className="text-red-500 text-sm mt-1">{errors.cuil.message}</p>
            )}
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