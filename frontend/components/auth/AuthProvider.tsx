'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { setApiToken } from '@/app/services/api';

// Sincroniza el accessToken de la sesión con el cliente axios (sin hacer fetch extra)
function TokenSync() {
  const { data: session } = useSession();
  useEffect(() => {
    setApiToken((session as any)?.accessToken ?? null);
  }, [session]);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <TokenSync />
      {children}
    </SessionProvider>
  );
}
