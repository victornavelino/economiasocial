// app/emprendedores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmprendedores, deleteEmprendedor } from '@/app/services/api';
import { Emprendedor } from '@/app/services/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';

export default function EmprendedoresPage() {
  const [emprendedores, setEmprendedores] = useState<Emprendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getEmprendedores();
      console.log(response.data);
      //setEmprendedores(response.data);
    } catch (err) {
      setError('Error al cargar los emprendedores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este emprendedor?')) {
      try {
        await deleteEmprendedor(id);
        fetchData(); // recargar lista
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Emprendedores</h1>
        <Link href="/emprendedores/nuevo">
          <Button variant="success">
            <Plus className="w-4 h-4 inline mr-2" />
            Nuevo Emprendedor
          </Button>
        </Link>
      </div>

      {emprendedores.length === 0 ? (
        <p className="text-gray-500 text-center">No hay emprendedores registrados</p>
      ) : (
        <div className="grid gap-4">
          {emprendedores.map((emp) => (
            <Card key={emp.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {emp.nombre} {emp.apellido}
                  </h2>
                  <p className="text-gray-600">DNI: {emp.documento_identidad}</p>
                  <p className="text-gray-600">Sexo: {emp.sexo}</p>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/emprendedores/${emp.id}`}>
                    <Button variant="secondary" className="p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/emprendedores/${emp.id}/editar`}>
                    <Button variant="primary" className="p-2">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="danger" className="p-2" onClick={() => handleDelete(emp.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}