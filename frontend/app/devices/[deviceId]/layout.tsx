'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Device } from '@/types/hydromind';
import { getDevices } from '@/lib/apiClient';

export default function DeviceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ deviceId: string }>;
}) {
  const resolvedParams = use(params);
  const deviceId = parseInt(resolvedParams.deviceId, 10);
  const pathname = usePathname();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDevices()
      .then((data) => {
        if (Array.isArray(data)) {
          setDevices(data);
        }
      })
      .catch(() => {
        setDevices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const currentDevice = devices.find((d) => d.id === deviceId);

  const handleDeviceSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = parseInt(e.target.value, 10);
    const subpath = pathname.replace(/\/devices\/\d+/, '');
    router.push(`/devices/${targetId}${subpath}`);
  };

  const navTabs = [
    {
      label: 'Overview',
      shortLabel: 'Overview',
      href: `/devices/${deviceId}`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Kontrol & Pengaturan',
      shortLabel: 'Kontrol',
      href: `/devices/${deviceId}/settings`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: 'Riwayat Grafik',
      shortLabel: 'Grafik',
      href: `/devices/${deviceId}/history`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: 'Log Notifikasi',
      shortLabel: 'Notifikasi',
      href: `/devices/${deviceId}/notifications`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Breadcrumb & Unit Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Daftar Unit
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">{currentDevice?.name || `Unit #${deviceId}`}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {currentDevice?.name || `Perangkat #${deviceId}`}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0 ${
                currentDevice?.is_online
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${currentDevice?.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {currentDevice?.is_online ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 font-mono">
            <span>Key: {currentDevice?.api_key_masked || '••••••••'}</span>
            <span>•</span>
            <span>Mode: {currentDevice?.setting?.mode || 'AUTO'}</span>
          </div>
        </div>

        {/* Quick Switch Dropdown */}
        {devices.length > 1 && (
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200 w-full sm:w-auto">
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium shrink-0">Ganti:</span>
            <select
              value={deviceId}
              onChange={handleDeviceSwitch}
              className="bg-white text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg py-1 px-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs w-full sm:w-auto"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.id === deviceId ? ' (Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 📱 Mobile & Desktop Segmented Navigation Tabs (100% Fit & Responsive) */}
      <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs">
        <nav className="grid grid-cols-4 gap-1 w-full" aria-label="Tabs">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-emerald-700 shadow-xs font-bold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {tab.icon}
                </span>
                {/* Short label on small screens (< 640px), Full label on >= 640px */}
                <span className="truncate block text-[10px] sm:hidden leading-none">
                  {tab.shortLabel}
                </span>
                <span className="truncate hidden sm:inline">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Viewport Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
