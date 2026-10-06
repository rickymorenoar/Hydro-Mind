'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-3 sm:p-4 overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Universal Top Industrial Navbar with Device Switcher */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">HydroMind Enterprise</span>
            <span>— Smart Greenhouse IoT Telemetry</span>
          </div>
        </div>
      </footer>
    </>
  );
}
