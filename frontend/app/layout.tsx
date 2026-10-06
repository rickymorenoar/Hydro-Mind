import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'HydroMind — Industrial IoT Water Management System',
  description: 'Intelligent Water Management and Solar Micro-grid Telemetry for Smart Greenhouse',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}

