'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: '#1a6fa0' }} className="text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span style={{ color: '#8dc63f' }}>●</span>
            <span className="hidden sm:inline">Trabajadores de la Economia Social</span>
            <span className="sm:hidden">TES</span>
          </Link>

          <div className="flex items-center space-x-1">
            <div className="hidden md:flex space-x-1 mr-4">
              <Link
                href="/emprendedores"
                className="px-3 py-2 rounded font-medium transition-colors hover:bg-white/10 text-sm"
              >
                Emprendedores
              </Link>
              <Link
                href="/mediodepago"
                className="px-3 py-2 rounded font-medium transition-colors hover:bg-white/10 text-sm"
              >
                Medios de Pago
              </Link>
              <Link
                href="/situacionfiscal"
                className="px-3 py-2 rounded font-medium transition-colors hover:bg-white/10 text-sm"
              >
                Situaciones Fiscales
              </Link>
              <Link
                href="/emprendimientos"
                className="px-3 py-2 rounded font-medium transition-colors hover:bg-white/10 text-sm"
              >
                Emprendimientos
              </Link>
            </div>

            <div className="h-6 w-px bg-white/20 mx-2 hidden md:block" />

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-[100px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</p>
                        <p className="text-sm font-semibold truncate text-slate-800">{session.user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn('micatamarca')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#1a6fa0] text-sm font-bold shadow-sm hover:bg-opacity-90 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Ingresar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}