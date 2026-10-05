'use client';

import { use, useEffect, useState } from 'react';
import ModeToggle from '@/components/ModeToggle';
import ThresholdForm from '@/components/ThresholdForm';
import { getLatest, updateSettings } from '@/lib/apiClient';

export default function DeviceSettingsPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const resolvedParams = use(params);
  const deviceId = parseInt(resolvedParams.deviceId, 10);

  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [pumpCmd, setPumpCmd] = useState<'ON' | 'OFF'>('OFF');
  const [moistureLower, setMoistureLower] = useState(40);
  const [moistureUpper, setMoistureUpper] = useState(70);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getLatest(deviceId)
      .then((data) => {
        if (data?.mode) setMode(data.mode);
      })
      .catch(() => {});
  }, [deviceId]);

  const handleModeChange = async (newMode: 'AUTO' | 'MANUAL') => {
    setLoading(true);
    setMode(newMode);
    try {
      await updateSettings(deviceId, { mode: newMode });
      setToast({ type: 'success', text: `Mode operasional berhasil dialihkan ke ${newMode}` });
    } catch {
      setToast({ type: 'error', text: 'Gagal mengirim konfigurasi mode ke backend' });
    } finally {
      setLoading(false);
    }
  };

  const handlePumpCommand = async (cmd: 'ON' | 'OFF') => {
    setLoading(true);
    setPumpCmd(cmd);
    try {
      await updateSettings(deviceId, { pump_cmd: cmd });
      setToast({
        type: 'success',
        text: `Perintah saklar manual pompa ${cmd} berhasil dikirim ke antrian ESP32`,
      });
    } catch {
      setToast({ type: 'error', text: 'Gagal mengirim perintah saklar manual ke server' });
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdSubmit = async (lower: number, upper: number) => {
    setLoading(true);
    try {
      await updateSettings(deviceId, { moisture_lower: lower, moisture_upper: upper });
      setMoistureLower(lower);
      setMoistureUpper(upper);
      setToast({
        type: 'success',
        text: `Parameter ambang kelembapan (${lower}% - ${upper}%) berhasil disimpan`,
      });
    } catch {
      setToast({ type: 'error', text: 'Gagal memperbarui ambang batas di database' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4 sm:space-y-6">
      {/* Feedback Toast */}
      {toast && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Card 1: Kontrol Mode Operasi & Override Manual */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm sm:text-base text-slate-900">Mode Operasi & Saklar Relay</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Tentukan apakah pompa dikontrol otomatis oleh ESP32 atau kendali manual operator
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">Pilihan Mode Kerja</span>
            <span className="text-[11px] text-slate-500">
              {mode === 'AUTO'
                ? 'Sistem otonom: Pompa menyiram otomatis berdasarkan sensor kelembapan.'
                : 'Sistem manual: Pompa hanya menyala saat tombol di dashboard ditekan.'}
            </span>
          </div>
          <div className="self-start sm:self-auto">
            <ModeToggle mode={mode} onToggle={handleModeChange} disabled={loading} />
          </div>
        </div>

        {/* Manual Pump Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              Saklar Manual Pompa Air Submersible
            </span>
            <span className="text-[11px] text-slate-500">
              {mode === 'AUTO'
                ? 'Tombol dinonaktifkan secara protektif karena sistem berada dalam mode AUTO.'
                : 'Kirim sinyal GPIO Relay langsung ke ESP32.'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handlePumpCommand('ON')}
              disabled={mode === 'AUTO' || loading || pumpCmd === 'ON'}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
            >
              Nyalakan (ON)
            </button>
            <button
              type="button"
              onClick={() => handlePumpCommand('OFF')}
              disabled={mode === 'AUTO' || loading || pumpCmd === 'OFF'}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
            >
              Matikan (OFF)
            </button>
          </div>
        </div>
      </div>

      {/* Card 2: Pengaturan Ambang Batas Histeresis */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm sm:text-base text-slate-900">Konfigurasi Ambang Batas Kelembapan (Histeresis)</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Nilai batas bawah (`moisture_lower`) dan batas atas (`moisture_upper`) untuk algoritma penyiraman otomatis
          </p>
        </div>

        <ThresholdForm
          initialLower={moistureLower}
          initialUpper={moistureUpper}
          onSubmit={handleThresholdSubmit}
          loading={loading}
        />
      </div>

      {/* Card 3: Informasi Hardware Perangkat ESP32 */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm sm:text-base text-slate-900">Spesifikasi Perangkat & Endpoint Gateway</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Detail integrasi mikrokontroler ESP32 DevKit V1</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px]">ENDPOINT TELEMETRI (POST):</span>
            <span className="text-slate-800 font-semibold break-all">/api/device/data</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px]">ENDPOINT PERINTAH (GET):</span>
            <span className="text-slate-800 font-semibold break-all">/api/device/command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
