'use client';

import { useState } from 'react';

interface ThresholdFormProps {
  initialLower: number;
  initialUpper: number;
  onSubmit: (lower: number, upper: number) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function ThresholdForm({
  initialLower,
  initialUpper,
  onSubmit,
  loading = false,
  disabled = false,
}: ThresholdFormProps) {
  const [lower, setLower] = useState(initialLower);
  const [upper, setUpper] = useState(initialUpper);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (lower >= upper) {
      setError('Batas bawah (start siram) harus lebih rendah dari batas atas (stop siram).');
      return;
    }
    if (lower < 0 || lower > 100 || upper < 0 || upper > 100) {
      setError('Nilai batas harus berada pada rentang 0% hingga 100%.');
      return;
    }
    setError('');
    onSubmit(lower, upper);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Visual Range Indicator Bar */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div className="flex justify-between font-mono text-slate-500 mb-1.5">
          <span>0% (Kering)</span>
          <span className="font-semibold text-emerald-700">Zona Ideal: {lower}% – {upper}%</span>
          <span>100% (Basah)</span>
        </div>
        <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          {/* Lower threshold band */}
          <div
            className="absolute top-0 bottom-0 bg-amber-400"
            style={{ left: '0%', width: `${lower}%` }}
            title="Zona Pompa Otomatis Hidup"
          />
          {/* Target green band */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500"
            style={{ left: `${lower}%`, width: `${upper - lower}%` }}
            title="Zona Kelembapan Optimal"
          />
          {/* High moisture band */}
          <div
            className="absolute top-0 bottom-0 bg-sky-400"
            style={{ left: `${upper}%`, width: `${100 - upper}%` }}
            title="Zona Pompa Otomatis Mati"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>🚨 Pompa ON saat &lt; {lower}%</span>
          <span>✅ Target Stabil</span>
          <span>🛑 Pompa OFF saat &gt; {upper}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Batas Bawah Pompa Hidup (`moisture_lower`)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              disabled={disabled}
              value={lower}
              onChange={(e) => setLower(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-medium text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3 top-2 text-xs font-mono text-slate-400 font-semibold">%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Jika kelembapan tanah di bawah nilai ini, ESP32 otomatis menyalakan pompa.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Batas Atas Pompa Mati (`moisture_upper`)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              disabled={disabled}
              value={upper}
              onChange={(e) => setUpper(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-medium text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3 top-2 text-xs font-mono text-slate-400 font-semibold">%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ketika kelembapan mencapai nilai ini, ESP32 otomatis mematikan pompa.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 rounded-lg">
          {error}
        </div>
      )}

      {!disabled && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Menyimpan ke Controller...' : 'Simpan Parameter Ambang Batas'}
          </button>
        </div>
      )}
    </form>
  );
}

