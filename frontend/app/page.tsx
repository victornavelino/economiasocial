'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { getEmprendedores } from '@/app/services/api';
import { 
  Loader2, LogIn, Rocket, Users, ShieldCheck, 
  CheckCircle2, Mail, Phone, Clock, FileDown, 
  ShieldAlert, Landmark, Sparkles
} from 'lucide-react';

const PRIMARY = '#1a6fa0';
const ACCENT = '#8dc63f';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  // Eliminamos el redireccionamiento automático para que el usuario pueda leer la landing
  useEffect(() => {
    // Solo cargamos datos básicos si es necesario en el futuro
  }, [session, status]);

  const isStaff = (session as any)?.isStaff;

  const navigateToApplication = () => {
    setRedirecting(true);
    if (isStaff) {
      router.push('/emprendedores');
    } else {
      getEmprendedores()
        .then((res) => {
          const items = res.data?.results ?? res.data ?? [];
          if (items.length > 0) {
            const id = items[0].emprendedor_id || items[0].id;
            router.push(`/emprendedores/${id}/editar`);
          } else {
            router.push('/emprendedores/nuevo');
          }
        })
        .catch(() => {
          router.push('/emprendedores/nuevo');
        });
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: PRIMARY }} />
        <p className="text-slate-500 font-medium animate-pulse">
          {redirecting ? 'Preparando su panel...' : 'Cargando sesión...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* ── Hero Section con Login ── */}
      <section className="relative overflow-hidden bg-white pb-16 pt-12 md:pb-24" style={{ backgroundColor: PRIMARY }}>
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            
            {/* Texto Hero */}
            <div className="md:w-3/5 text-center md:text-left text-white relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest mb-6 border border-white/20">
                <Landmark className="w-3 h-3" />
                Gobierno de Catamarca
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
                Economía <span style={{ color: PRIMARY }}>Social</span> <br />
                y <span style={{ color: ACCENT }}>Solidaria</span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed mb-8">
                Portal provincial de registro y gestión para emprendedores. Acceda a beneficios exclusivos y fortalezca su desarrollo productivo.
              </p>
              {status === 'authenticated' && session ? (
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-2">
                    <p className="text-white text-sm">
                      Bienvenido/a, <span className="font-bold text-green-400">{(session.user as any)?.name || 'Usuario'}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <button
                      onClick={navigateToApplication}
                      className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 font-black shadow-xl hover:scale-[1.05] active:scale-95 transition-all"
                    >
                      <Rocket className="w-5 h-5 text-sky-600" />
                      {isStaff ? 'Gestionar Emprendedores' : 'Continuar a mi Inscripción'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button
                    onClick={() => signIn('micatamarca')}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <LogIn className="w-5 h-5" />
                    Ingresar con Mi Catamarca
                  </button>
                  <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                    <FileDown className="w-5 h-5" />
                    Guía Rápida (PDF)
                  </button>
                </div>
              )}
            </div>

            {/* Tarjeta de Inicio */}
            <div className="md:w-2/5 w-full max-w-sm">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3" style={{ backgroundColor: ACCENT }}>
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Comience hoy</h3>
                  <p className="text-slate-400 text-sm text-center mb-8">Únase a los más de 500 emprendedores ya registrados en toda la provincia.</p>
                  
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-sky-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Validación</p>
                        <p className="text-[10px] text-slate-400">Identidad 100% segura</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-green-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Comunidad</p>
                        <p className="text-[10px] text-slate-400">Fomento productivo local</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Beneficios ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Beneficios de inscribirse</h2>
            <div className="w-20 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Acceso a capacitaciones especializadas.",
              "Participación en ferias y el Mercado Itinerante.",
              "Uso de Establecimientos Comunitarios.",
              "Acceso a la cuota del 30% de compras públicas."
            ].map((text, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto y Soporte ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Soporte y contacto</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Nuestro equipo está disponible para asistirlo en cada paso de su inscripción. No dude en contactarnos ante cualquier consulta técnica o administrativa.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sky-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Correo Oficial</p>
                  <p className="font-bold text-slate-700">registro.essyp@catamarca.gob.ar</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sky-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Horario de atención</p>
                  <p className="font-bold text-slate-700">Lun a Vie de 8:00 a 18:00 hs.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-xl font-bold mb-4">¿Necesita ayuda guiada?</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">Descargue nuestro manual de usuario paso a paso realizado por la Dirección de Prensa MDS.</p>
              <button className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                <FileDown className="w-5 h-5" />
                DESCARGAR GUÍA DE INSCRIPCIÓN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer / Aviso Legal ── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-slate-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Protección de datos</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 italic">
                “Tus datos serán tratados con confidencialidad según la Ley 25.326 de Protección de Datos Personales y la Ley Provincial 5746 de ESSyP.”
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Ministerio de Economía • Gobierno de Catamarca</p>
            <p className="text-[10px] text-slate-400">© 2026 — Secretaría de Economía Social y Solidaria</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
