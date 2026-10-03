'use client';

import { use, useEffect, useState } from 'react';
import TrendChart from '@/components/TrendChart';
import type { HistoryPoint } from '@/types/hydromind';
import { getHistory } from '@/lib/apiClient';

export default function DeviceHistoryPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const resolvedParams = use(params);
  const deviceId = parseInt(resolvedParams.deviceId, 10);

  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [moistureData, setMoistureData] = useState<HistoryPoint[]>([]);
  const [voltageData, setVoltageData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getHistory(deviceId, 'soil_moisture', range).catch(() => []),
      getHistory(deviceId, 'battery_voltage', range).catch(() => []),
    ]).then(([mRes, vRes]) => {
      if (isMounted) {
        setMoistureData(Array.isArray(mRes) ? mRes : []);
        setVoltageData(Array.isArray(vRes) ? vRes : []);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [deviceId, range]);

  const hasData = moistureData.length > 0 || voltageData.length > 0;

  return (
    <div className="space-y-6">
      {/* Historical Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-base text-slate-900">Riwayat & Analisis Telemetri Sensor</h2>
          <p className="text-xs text-slate-500">
            Pola fluktuasi kadar air media tanam serta siklus pengisian baterai tenaga surya
          </p>
        </div>

        {/* Range Selector */}
        <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 self-start sm:self-auto shadow-2xs">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                range === r
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === '24h' ? '24 Jam Terakhir' : r === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Section / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={moistureData}
            label="Tren Kelembapan Tanah (Soil Moisture)"
            sublabel="Fluktuasi kadar air media tanam (%) — Target 40%–70%"
            color="#059669"
            unit="%"
          />

          <TrendChart
            data={voltageData}
            label="Tren Tegangan Baterai Tenaga Surya"
            sublabel="Kurva tegangan catu daya (Volt) — Nominal 11.1V–12.6V"
            color="#d97706"
            unit="V"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18M19 9l-5 5-4-4-3 3" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Data Riwayat Telemetri</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Grafik akan terbentuk secara otomatis seiring ESP32 mengirimkan pembacaan sensor berkala ke server.
          </p>
        </div>
      )}
    </div>
  );
}
