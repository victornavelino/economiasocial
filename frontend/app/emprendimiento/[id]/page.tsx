'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEmprendimiento } from '@/app/services/api';
import { ArrowLeft, Rocket, Briefcase, User, Info, FileText, Settings, ExternalLink } from 'lucide-react';

interface Emprendimiento {
  id: number;
  nombre_marca: string;
  tipo_produccion: string;
  nivel_emprendimiento: string;
  rubro_nombre: string;
  emprendedor_nombre: string;
  emprendedor: number;
  rubro: number;
  servicio: number;
  servicio_nombre?: string; // If added later
}

const TIPO_PRODUCCION_LABEL: Record<string, string> = {
  artesanal: 'Artesanal',
  semi_industrial: 'Semi Industrial',
  servicio: 'Servicio',
};

const NIVEL_LABEL: Record<string, string> = {
  idea_inicial: 'Idea Inicial',
  produccion_pequena_escala: 'Producción Pequeña Escala',
  produccion_habilitada: 'Producción Habilitada',
  escalamiento_productivo: 'Escalamiento Productivo',
  comercializacion_exportacion: 'Comercialización/Exportación',
};

const PRIMARY = '#1a6fa0';
const PRIMARY_LIGHT = '#e8f3fa';
const ACCENT = '#8dc63f';

export default function EmprendimientoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [emprendimiento, setEmprendimiento] = useState<Emprendimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getEmprendimiento(Number(id));
        setEmprendimiento(response.data);
      } catch (err) {
        setError('No se pudo cargar la información del emprendimiento');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1a6fa0] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !emprendimiento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ups! Algo salió mal</h2>
          <p className="text-slate-500 mb-6">{error || 'El emprendimiento no existe'}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner with subtle gradient */}
      <div className="h-32 bg-gradient-to-r from-[#1a6fa0] to-[#2a8fb0] relative" />

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="p-6 sm:p-8 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-[#8dc63f] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8dc63f]/20 shrink-0">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {emprendimiento.nombre_marca}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 font-medium">
                    <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-[11px] uppercase tracking-wider font-bold">
                      ID: {emprendimiento.id}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-sm">Venture Profile</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Regresar
              </button>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-10">
            
            {/* Owner Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-[#1a6fa0] rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Emprendedor Responsable</h2>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1a6fa0] font-bold text-lg border border-slate-100">
                    {emprendimiento.emprendedor_nombre?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {emprendimiento.emprendedor_nombre}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">Titular del emprendimiento</p>
                  </div>
                </div>
                <Link href={`/emprendedores/${emprendimiento.emprendedor}`}>
                  <button className="p-2.5 text-slate-400 hover:text-[#1a6fa0] hover:bg-white rounded-xl transition-all">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </section>

            {/* Technical Info */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Información Técnica</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-widest">Rubro / Categoría</span>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1a6fa0]" />
                    <span className="font-bold text-slate-700">{emprendimiento.rubro_nombre || 'No especificado'}</span>
                  </div>
                </div>
                
                <div className="p-5 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-widest">Tipo de Producción</span>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#8dc63f]" />
                    <span className="font-bold text-slate-700">
                      {TIPO_PRODUCCION_LABEL[emprendimiento.tipo_produccion] || emprendimiento.tipo_produccion}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-5 border border-slate-100 rounded-2xl bg-slate-50/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-widest">Estado de Desarrollo</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#8dc63f] h-full" 
                      style={{ 
                        width: 
                          emprendimiento.nivel_emprendimiento === 'idea_inicial' ? '20%' :
                          emprendimiento.nivel_emprendimiento === 'produccion_pequena_escala' ? '40%' :
                          emprendimiento.nivel_emprendimiento === 'produccion_habilitada' ? '60%' :
                          emprendimiento.nivel_emprendimiento === 'escalamiento_productivo' ? '80%' : '100%'
                      }} 
                    />
                  </div>
                  <span className="font-extrabold text-[#1a6fa0] text-sm whitespace-nowrap">
                    {NIVEL_LABEL[emprendimiento.nivel_emprendimiento] || emprendimiento.nivel_emprendimiento}
                  </span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
