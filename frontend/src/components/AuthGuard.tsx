'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === '/login';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.replace('/login');
      } else if (isAuthenticated && isPublicRoute) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  // When loading session or during unauthorized state transition, show a clean loader
  if (isLoading || (!isAuthenticated && !isPublicRoute) || (isAuthenticated && isPublicRoute)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-700">HydroMind Security</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Memverifikasi otentikasi pengguna...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
