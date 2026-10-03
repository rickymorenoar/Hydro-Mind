'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DeviceCard from '@/components/DeviceCard';
import AddDeviceModal from '@/components/AddDeviceModal';
import type { Device } from '@/types/hydromind';
import { getDevices, createDevice } from '@/lib/apiClient';

export default function AllDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDevices = async () => {
    try {
      const data = await getDevices();
      if (Array.isArray(data)) {
        setDevices(data);
      } else {
        setDevices([]);
      }
    } catch {
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const timer = setInterval(fetchDevices, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateDevice = async (name: string) => {
    const result = await createDevice(name);
    await fetchDevices();
    return result;
  };

  // Fleet summary stats
  const totalUnits = devices.length;
  const onlineUnits = devices.filter((d) => d.is_online).length;
  const activePumps = devices.filter((d) => d.latest_reading?.pump_status === 'ON').length;
  const avgMoisture = devices.length
    ? (
        devices.reduce((acc, d) => acc + (d.latest_reading?.soil_moisture || 0), 0) /
        devices.length
      ).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Fleet Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Seluruh Unit Greenhouse
            </h1>
            <span className="bg-slate-200 text-slate-700 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
              {totalUnits} Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring multi-device, kondisi mikroklimat tanah, dan jaringan pompa otonom tenaga surya.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Registrasi Device Baru
        </button>
      </div>

      {/* Fleet KPI Summary Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Total Perangkat Terdaftar</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalUnits}</span>
            <span className="text-xs text-emerald-600 font-semibold">{onlineUnits} Online</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Pompa Sedang Menyiram</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-sky-600">{activePumps}</span>
            <span className="text-xs text-slate-500">Unit Aktif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Rata-rata Kelembapan Tanah</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{avgMoisture}%</span>
            <span className="text-xs text-slate-400 font-medium">Telemetry Fleet</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Catu Daya Tenaga Surya</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600">100%</span>
            <span className="text-xs text-slate-500">Standar Mandiri</span>
          </div>
        </div>
      </div>

      {/* Device Grid / Empty State */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Daftar Perangkat
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {devices.length > 0 ? 'Pilih unit untuk melihat telemetri terperinci' : 'Belum ada perangkat aktif'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-slate-900">Belum Ada Unit Device yang Terdaftar</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Database saat ini masih kosong. Daftarkan unit greenhouse/ESP32 per
                Device Anda untuk mendapatkan API Key.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Daftarkan Unit Pertama Sekarang
              </button>

              <Link
                href="/guide"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Baca Panduan Firmware
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Provisioning Dialog */}
      <AddDeviceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateDevice}
      />
    </div>
  );
}
