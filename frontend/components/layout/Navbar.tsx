'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Scissors,
  Layers,
  Rocket,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  LogIn,
  Menu,
} from 'lucide-react';
import { getEmprendedores } from '@/app/services/api';


const MENU_ITEMS = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/emprendedores', label: 'Emprendedores', icon: Users },
  { href: '/emprendimiento', label: 'Emprendimientos', icon: Rocket },
  { href: '/servicio', label: 'Servicios', icon: Scissors },
  { href: '/rubro', label: 'Rubros', icon: Layers },
  { href: '/mediodepago', label: 'Medios de Pago', icon: CreditCard },
  { href: '/situacionfiscal', label: 'Sit. Fiscales', icon: FileText },
];

const PRIMARY = '#1a6fa0';
const ACCENT = '#8dc63f';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [citizenLink, setCitizenLink] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Cargar link para ciudadanos si no es staff — solo una vez al autenticarse
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session &&
      !(session as any).isStaff &&
      !fetchedRef.current
    ) {
      fetchedRef.current = true;
      getEmprendedores()
        .then((res) => {
          const items = res.data?.results ?? res.data ?? [];
          if (items.length > 0) {
            setCitizenLink(`/emprendedores/${items[0].emprendedor_id}/editar`);
          } else {
            setCitizenLink('/emprendedores/nuevo');
          }
        })
        .catch(() => {
          setCitizenLink('/emprendedores/nuevo');
        });
    }
    // Reset ref on logout
    if (status === 'unauthenticated') {
      fetchedRef.current = false;
      setCitizenLink(null);
    }
  }, [session, status]);

  const isAdmin = (session as any)?.isStaff;

  const visibleMenuItems = isAdmin
    ? MENU_ITEMS
    : citizenLink
      ? [
        { href: '/', label: 'Inicio', icon: LayoutDashboard },
        { href: citizenLink, label: 'Mi Inscripción', icon: Users }
      ]
      : [];


  // Auto-collapse factor: on small desktops
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavItem = ({ href, label, icon: Icon }: any) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 mb-1 ${isActive
            ? 'bg-white/15 text-white shadow-sm'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        title={isCollapsed ? label : ''}
      >
        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-green-400' : 'group-hover:scale-110 transition-transform'}`}
          style={{ color: isActive ? ACCENT : '' }} />
        {!isCollapsed && <span className="font-medium text-sm truncate">{label}</span>}
        {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />}
      </Link>
    );
  };

  const handleLogout = async () => {
    // Cerrar sesión localmente y redirigir al inicio sin afectar la sesión de MICA
    await signOut({ callbackUrl: '/' });
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{ backgroundColor: PRIMARY }}>

      {/* Header */}
      <div className="h-20 flex items-center px-4 border-b border-white/10 relative">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT }}>
            <span className="font-bold text-white text-lg leading-none">E</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm tracking-tight">Economía</span>
              <span className="text-[11px] font-medium text-white/60">Social</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white text-[#1a6fa0] border border-slate-200 flex items-center justify-center shadow-md hover:scale-110 transition-all z-50 hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
        {!isCollapsed && <p className="text-[10px] uppercase font-bold text-white/40 px-3 mb-4 tracking-widest">
            {isAdmin ? 'Administración' : 'Ciudadano'}
        </p>}
        {visibleMenuItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {status === 'loading' ? (
          <div className="h-12 w-full bg-white/5 animate-pulse rounded-xl" />
        ) : session ? (
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-lg border border-white/10 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                <UserIcon className="w-4 h-4 text-white/60" />
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold truncate leading-tight">{session.user?.name || 'Usuario'}</p>
                <p className="text-[10px] text-white/50 truncate">{session.user?.email}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn('micatamarca')}
            className={`w-full flex items-center gap-2 py-3 rounded-xl font-bold text-sm bg-white text-[#1a6fa0] hover:bg-white/90 shadow-lg active:scale-95 transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <LogIn className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Ingresar</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block relative z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle & Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
            <span className="font-bold text-white text-lg leading-none">E</span>
          </div>
          <span className="font-bold text-slate-800 tracking-tight">Economía Social</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-[#1a6fa0] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="h-full w-64 animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
            {/* Override the width for mobile */}
            <style jsx global>{`
              .lg\\:hidden div { width: 16rem !important; }
            `}</style>
          </div>
        </div>
      )}

      {/* Mobile Content Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}
