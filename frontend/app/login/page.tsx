'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  useEffect(() => {
    // Redirigir automáticamente al proveedor de Catamarca
    signIn('micatamarca', { callbackUrl: '/' });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner o indicador de carga premium */}
        <div className="w-12 h-12 border-4 border-[#1a6fa0] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">
          Redirigiendo al portal de Mi Catamarca...
        </p>
      </div>
    </div>
  );
}
