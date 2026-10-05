'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import GaugeCard from '@/components/GaugeCard';
import PumpStatusBadge from '@/components/PumpStatusBadge';
import BatteryIndicator from '@/components/BatteryIndicator';
import { getLatest, getNotifications } from '@/lib/apiClient';
import type { NotifLogEntry } from '@/types/hydromind';

interface ReadingData {
  soil_moisture: number;
  air_temp: number;
  air_humidity: number;
  pump_status: 'ON' | 'OFF';
  water_flow: number;
  battery_level: number;
  battery_voltage: number;
  mode: 'AUTO' | 'MANUAL';
  pump_cmd?: 'ON' | 'OFF';
  is_online?: boolean;
  last_seen_diff?: string | null;
  created_at: string;
}

export default function DeviceOverviewPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const resolvedParams = use(params);
  const deviceId = parseInt(resolvedParams.deviceId, 10);

  const [data, setData] = useState<ReadingData | null>(null);
  const [notifs, setNotifs] = useState<NotifLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [res, notifRes] = await Promise.all([
          getLatest(deviceId),
          getNotifications(deviceId).catch(() => ({ data: [] })),
        ]);

        if (res && isMounted) {
          if (res.soil_moisture !== null && res.soil_moisture !== undefined) {
            setData(res);
            setLastUpdated(new Date());
            setIsLive(res.is_online ?? false);
          } else {
            setData(null);
            setIsLive(false);
          }
          setLoading(false);
        }

        if (notifRes?.data && isMounted) {
          setNotifs(notifRes.data.slice(0, 3));
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 sm:h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Case: No readings sent yet by ESP32 for this device
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div className="space-y-1 max-w-lg">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Menunggu Data Telemetri Pertama dari ESP32</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Perangkat ini telah terdaftar di sistem. Silakan nyalakan ESP32 Anda untuk mengirimkan pembacaan 10 field telemetri sesuai spesifikasi proposal.
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-slate-900 text-slate-100 rounded-xl text-left max-w-md w-full font-mono text-[11px] space-y-1">
            <span className="text-emerald-400 text-[10px] block">Tabel 5.1 Payload Format (POST /api/device/data):</span>
            <pre className="text-[10px] text-slate-300 overflow-x-auto">
{`{
  "soil_moisture": 52.4,
  "air_temp": 28.5,
  "air_humidity": 65.0,
  "pump_status": "OFF",
  "water_flow": 0.0,
  "battery_level": 85.0,
  "battery_voltage": 12.1
}`}
            </pre>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link
              href={`/devices/${deviceId}/settings`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
            >
              Atur Mode & Ambang Batas
            </Link>
            <Link
              href="/guide"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors"
            >
              Panduan Pemetaan Proposal (Tabel 5.1)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const soilMoisture = Number(data.soil_moisture || 0);
  const airTemp = Number(data.air_temp || 0);
  const airHumidity = Number(data.air_humidity || 0);
  const waterFlow = Number(data.water_flow || 0);
  const batteryLevel = Number(data.battery_level || 0);
  const batteryVoltage = Number(data.battery_voltage || 0);

  const isDeviceOnline = data.is_online ?? false;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Telemetry Live Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isDeviceOnline
                ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-100'
                : 'bg-slate-400'
            }`}
          />
          <span className="font-semibold text-slate-800">
            {isDeviceOnline ? 'Perangkat Online (Transmisi Aktif)' : 'Perangkat Offline (Mati / Terputus)'}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {data.last_seen_diff ? `Terakhir aktif: ${data.last_seen_diff}` : (data.created_at ? new Date(data.created_at).toLocaleTimeString() : '-')}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-[11px]">
          <span className="text-slate-500 font-mono">
            Sinkronisasi Web: {lastUpdated ? lastUpdated.toLocaleTimeString() : '-'}
          </span>
          <Link
            href={`/devices/${deviceId}/settings`}
            className="font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            Kontrol Mode & Ambang →
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (4 Telemetry Metric Cards: Real-Time Numbers & Icons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: soil_moisture (Kadar Air Tanah) */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-medium">
              <span className="truncate">Kelembapan Tanah</span>
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-700 font-bold">
                soil_moisture
              </span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1.5 sm:mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                {soilMoisture.toFixed(1)}
              </span>
              <span className="font-mono text-xs sm:text-sm text-slate-500 font-bold">%</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
            <span>Status:</span>
            <span className={`font-semibold truncate ${soilMoisture < 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {soilMoisture < 40 ? 'Kering (<40%)' : soilMoisture > 70 ? 'Basah (>70%)' : 'Ideal'}
            </span>
          </div>
        </div>

        {/* Metric 2: water_flow & pump_status */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-medium">
              <span className="truncate">Debit & Pompa</span>
              <span
                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold ${
                  data.pump_status === 'ON'
                    ? 'bg-sky-100 text-sky-800 animate-pulse'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {data.pump_status}
              </span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1.5 sm:mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                {waterFlow.toFixed(1)}
              </span>
              <span className="font-mono text-xs sm:text-sm text-slate-500 font-bold">L/m</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
            <span>water_flow:</span>
            <span className={`font-semibold truncate ${data.pump_status === 'ON' ? 'text-sky-600' : 'text-slate-500'}`}>
              {data.pump_status === 'ON' ? 'Menyiram' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Metric 3: air_temp & air_humidity (DHT22) */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-medium">
              <span className="truncate">Suhu & Udara</span>
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 font-bold">
                DHT22
              </span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1.5 sm:mt-2 font-mono">
              <span className="text-xl sm:text-3xl font-bold text-slate-900">{airTemp.toFixed(1)}°C</span>
              <span className="text-slate-300 text-sm sm:text-xl font-light">/</span>
              <span className="text-base sm:text-2xl font-bold text-slate-700">{airHumidity.toFixed(0)}%</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
            <span>air_temp/humidity:</span>
            <span className="font-semibold text-slate-700 truncate">DHT22 Aktif</span>
          </div>
        </div>

        {/* Metric 4: battery_voltage & battery_level */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-medium">
              <span className="truncate">Baterai Surya</span>
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-50 text-amber-800 font-bold">
                3S Li-ion
              </span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1.5 sm:mt-2 font-mono">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {batteryVoltage.toFixed(1)}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold">V</span>
              <span className="text-[10px] sm:text-xs text-slate-400">({batteryLevel.toFixed(0)}%)</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
            <span>battery_level:</span>
            <span className={`font-semibold truncate ${batteryLevel < 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {batteryLevel < 20 ? 'Kritis (<20%)' : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual Zone Telemetry Section (Gauge Charts, Icons & Progress Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Section 1: Zona Pengairan & Kelembapan Tanah */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Monitoring Irigasi & Tanah</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">soil_moisture (Gauge chart) & pump_status (Indikator Ikon)</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-mono font-medium">
              Mode: {data.mode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <GaugeCard
              label="soil_moisture (Gauge Chart)"
              value={soilMoisture}
              min={0}
              max={100}
              unit="%"
              targetRange={{ min: 40, max: 70, label: 'Ideal' }}
              colorScheme="emerald"
            />
            <PumpStatusBadge status={data.pump_status} flowRate={waterFlow} />
          </div>
        </div>

        {/* Section 2: Zona Catu Daya Mandiri Tenaga Surya */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Monitoring Daya Tenaga Surya</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">battery_voltage (Gauge chart) & battery_level (Progress bar)</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs font-mono font-medium">
              3S Li-ion (11.1V)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <GaugeCard
              label="battery_voltage (Gauge Chart)"
              value={batteryVoltage}
              min={8.0}
              max={13.0}
              unit="V"
              targetRange={{ min: 11.1, max: 12.6 }}
              colorScheme="solar"
            />
            <div className="flex flex-col justify-center">
              <BatteryIndicator level={batteryLevel} voltage={batteryVoltage} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: notif_log (Tabel Log Riwayat Sistem - Tabel 5.1 Proposal) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Log Notifikasi Sistem (notif_log)</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Deteksi otomatis kondisi kritis: selang tersumbat/pompa gagal & tegangan baterai rendah
            </p>
          </div>
          <Link
            href={`/devices/${deviceId}/notifications`}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            Lihat Semua Log →
          </Link>
        </div>

        {notifs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded-xl border border-slate-100">
            ✓ Tidak ada notifikasi anomali. Sistem beroperasi normal.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifs.map((n) => (
              <div key={n.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      n.type === 'CLOG_OR_PUMP_FAIL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {n.type === 'CLOG_OR_PUMP_FAIL' ? 'SELANG / POMPA' : 'BATERAI RENDAH'}
                  </span>
                  <span className="text-slate-700 font-medium leading-relaxed">{n.message}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(n.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
