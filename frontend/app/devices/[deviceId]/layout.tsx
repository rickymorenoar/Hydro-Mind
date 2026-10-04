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
    { label: 'Overview & Telemetri', href: `/devices/${deviceId}` },
    { label: 'Kontrol & Pengaturan Ambang', href: `/devices/${deviceId}/settings` },
    { label: 'Riwayat Grafik & Tren', href: `/devices/${deviceId}/history` },
    { label: 'Log Notifikasi ', href: `/devices/${deviceId}/notifications` },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Unit Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-emerald-700">Daftar Unit</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{currentDevice?.name || `Unit #${deviceId}`}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentDevice?.name || `Perangkat #${deviceId}`}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                currentDevice?.is_online
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${currentDevice?.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {currentDevice?.is_online ? 'Perangkat Online (Active)' : 'Perangkat Offline / Standby'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>Key: {currentDevice?.api_key_masked || '••••••••'}</span>
            <span>•</span>
            <span>Mode: {currentDevice?.setting?.mode || 'AUTO'}</span>
          </div>
        </div>

        {/* Quick Switch Dropdown in Subheader */}
        {devices.length > 1 && (
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Ganti Unit:</span>
            <select
              value={deviceId}
              onChange={handleDeviceSwitch}
              className="bg-white text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
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

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto bg-white px-3 pt-2 rounded-xl border shadow-2xs">
        {navTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Viewport Content */}
      <div>{children}</div>
    </div>
  );
}
