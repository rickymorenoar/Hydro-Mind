'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import GaugeCard from '@/components/GaugeCard';
import PumpStatusBadge from '@/components/PumpStatusBadge';
import BatteryIndicator from '@/components/BatteryIndicator';
import { getLatest } from '@/lib/apiClient';

interface ReadingData {
  soil_moisture: number;
  air_temp: number;
  air_humidity: number;
  pump_status: 'ON' | 'OFF';
  water_flow: number;
  battery_level: number;
  battery_voltage: number;
  mode: 'AUTO' | 'MANUAL';
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
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await getLatest(deviceId);
        if (res && res.soil_moisture !== undefined && isMounted) {
          setData(res);
          setLastUpdated(new Date());
          setIsLive(true);
          setLoading(false);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Case: No readings sent yet by ESP32 for this device
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div className="space-y-1 max-w-lg">
            <h3 className="text-base font-bold text-slate-900">Menunggu Data Telemetri Pertama dari Perangkat ESP32</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unit ini telah terdaftar di sistem, namun belum ada pembacaan sensor yang dikirim ke server. Pastikan ESP32 telah dinyalakan dan mengirimkan request ke endpoint backend.
            </p>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-left max-w-md w-full font-mono text-xs space-y-1.5">
            <span className="text-emerald-400 text-[11px] block">Contoh Payload POST /api/device/data:</span>
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

          <div className="flex items-center gap-3 pt-2">
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
              Panduan Konfigurasi ESP32
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

  return (
    <div className="space-y-6">
      {/* Telemetry Live Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="font-semibold text-slate-800">
            {isLive ? 'Gateway REST Terhubung (Live Polling 4s)' : 'Menunggu Sinyal Terbaru'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono">
            Timestamp: {data.created_at ? new Date(data.created_at).toLocaleTimeString() : '-'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono">
            Terakhir di-refresh: {lastUpdated ? lastUpdated.toLocaleTimeString() : '-'}
          </span>
          <Link
            href={`/devices/${deviceId}/settings`}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            Ubah Pengaturan Ambang →
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (4 Telemetry Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Kelembapan Tanah */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Kelembapan Tanah</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-700 font-bold">
                Sensor Kapasitif
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-bold text-slate-900">
                {soilMoisture.toFixed(1)}
              </span>
              <span className="font-mono text-sm text-slate-500 font-bold">%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status Media:</span>
            <span className={`font-semibold ${soilMoisture < 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {soilMoisture < 40 ? 'Kering (Butuh Air)' : soilMoisture > 75 ? 'Sangat Basah' : 'Ideal / Sehat'}
            </span>
          </div>
        </div>

        {/* Metric 2: Debit Pompa Irigasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Debit Pompa Irigasi</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  data.pump_status === 'ON'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Relay {data.pump_status}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-bold text-slate-900">
                {waterFlow.toFixed(1)}
              </span>
              <span className="font-mono text-sm text-slate-500 font-bold">L/m</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Aliran Air:</span>
            <span className={`font-semibold ${data.pump_status === 'ON' ? 'text-sky-600' : 'text-slate-500'}`}>
              {data.pump_status === 'ON' ? 'Menyiram Tanaman' : 'Standby Tertutup'}
            </span>
          </div>
        </div>

        {/* Metric 3: Suhu & Kelembapan Udara */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Mikroklimat Udara</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 font-bold">
                DHT22
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-2 font-mono">
              <div>
                <span className="text-3xl font-bold text-slate-900">{airTemp.toFixed(1)}</span>
                <span className="text-sm text-slate-500 ml-0.5">°C</span>
              </div>
              <span className="text-slate-300 text-xl font-light">/</span>
              <div>
                <span className="text-3xl font-bold text-slate-700">{airHumidity.toFixed(0)}</span>
                <span className="text-sm text-slate-500 ml-0.5">%RH</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Kondisi Greenhouse:</span>
            <span className="font-semibold text-slate-700">Optimal Tumbuh</span>
          </div>
        </div>

        {/* Metric 4: Tegangan Baterai Tenaga Surya */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Catu Daya Tenaga Surya</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-50 text-amber-800 font-bold">
                SCC 3S Li-ion
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 font-mono">
              <span className="text-3xl font-bold text-slate-900">
                {batteryVoltage.toFixed(2)}
              </span>
              <span className="text-sm text-slate-500 font-bold">V</span>
              <span className="text-xs text-slate-400">({batteryLevel.toFixed(0)}%)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status SCC Solar:</span>
            <span className={`font-semibold ${batteryLevel < 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {batteryLevel < 20 ? 'Baterai Kritis' : 'Normal / Terisi'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual Zone Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Zona Pengairan & Kelembapan Tanah */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Monitoring Irigasi & Tanah</h3>
              <p className="text-xs text-slate-500">Parameter kelembapan media tanam dan verifikasi semprotan</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">
              Mode: {data.mode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GaugeCard
              label="Kadar Air Tanah (Soil Moisture)"
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Monitoring Daya Tenaga Surya</h3>
              <p className="text-xs text-slate-500">2x Panel Surya Mini, Solar Charge Controller & Baterai 3S</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-mono font-medium">
              11.1V Nominal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GaugeCard
              label="Tegangan Baterai (Voltage)"
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
    </div>
  );
}
