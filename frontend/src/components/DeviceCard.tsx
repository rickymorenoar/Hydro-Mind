'use client';

import Link from 'next/link';
import type { Device } from '@/types/hydromind';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const r = device.latest_reading;
  const isOnline = device.is_online;
  const soilMoisture = r?.soil_moisture ?? 0;
  const airTemp = r?.air_temp ?? 0;
  const airHumidity = r?.air_humidity ?? 0;
  const batteryLevel = r?.battery_level ?? 0;
  const batteryVoltage = r?.battery_voltage ?? 0;
  const pumpStatus = r?.pump_status ?? 'OFF';
  const waterFlow = r?.water_flow ?? 0;
  const mode = device.setting?.mode ?? 'AUTO';

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
      <div>
        {/* Card Header: Device Name & Status Badges */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  isOnline ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                }`}
                title={isOnline ? 'Device Aktif (Heartbeat < 5m)' : 'Device Offline'}
              />
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-tight truncate">
                {device.name}
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
              ID #{device.id} • Key: {device.api_key_masked}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded ${
                mode === 'AUTO'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {mode}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded ${
                isOnline
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Primary Metrics Grid (4-box Telemetry) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 py-3.5">
          {/* Soil Moisture */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">Kelembapan Tanah</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-lg sm:text-xl font-bold text-slate-900">
                {soilMoisture.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500">%</span>
            </div>
            {/* Status bar */}
            <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  soilMoisture < 40 ? 'bg-amber-500' : soilMoisture > 75 ? 'bg-sky-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, soilMoisture))}%` }}
              />
            </div>
          </div>

          {/* Pump Relay & Flow */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">Pompa & Debit</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg sm:text-xl font-bold text-slate-900">
                  {waterFlow.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-500">L/m</span>
              </div>
              <span
                className={`px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold rounded ${
                  pumpStatus === 'ON'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {pumpStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
              {pumpStatus === 'ON' ? 'Menyiram' : 'Standby'}
            </p>
          </div>

          {/* Air Temp & Humidity */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">Suhu & Udara</span>
            <div className="flex items-baseline gap-1.5 mt-0.5 font-mono text-xs sm:text-sm font-semibold text-slate-800 truncate">
              <span>{airTemp.toFixed(1)}°C</span>
              <span className="text-slate-300">/</span>
              <span>{airHumidity.toFixed(0)}%RH</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">DHT22</p>
          </div>

          {/* Solar Battery */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block truncate">Baterai Surya</span>
            <div className="flex items-baseline justify-between mt-0.5 font-mono">
              <span className="text-xs sm:text-sm font-bold text-slate-900">{batteryLevel.toFixed(0)}%</span>
              <span className="text-[10px] sm:text-xs text-slate-500">{batteryVoltage.toFixed(1)}V</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  batteryLevel < 20 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
          {device.last_seen_diff ? `Aktif: ${device.last_seen_diff}` : (r?.created_at ? new Date(r.created_at).toLocaleTimeString() : 'Belum ada data')}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/devices/${device.id}/settings`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Kontrol
          </Link>
          <Link
            href={`/devices/${device.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors flex items-center gap-1"
          >
            Buka Monitor
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
