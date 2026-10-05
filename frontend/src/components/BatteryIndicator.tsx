'use client';

interface BatteryIndicatorProps {
  level: number;
  voltage: number;
}

export default function BatteryIndicator({ level, voltage }: BatteryIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, level));
  const isLow = clamped < 20;

  return (
    <div className="space-y-3 p-3.5 sm:p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isLow ? 'text-rose-500 shrink-0' : 'text-amber-500 shrink-0'}>
            <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
            <line x1="22" y1="11" x2="22" y2="13" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">Kapasitas Penyimpanan Baterai</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-800">
          {voltage.toFixed(2)} Volt (3S Li-ion)
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isLow ? 'bg-rose-500' : clamped < 50 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${clamped}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-slate-700">
          {clamped.toFixed(0)}%
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-mono pt-1">
        <span>Cut-off: 9.0V</span>
        <span className={isLow ? 'text-rose-600 font-bold' : 'text-emerald-700 font-medium'}>
          {isLow ? '⚠️ Level Kritis' : '● Pengisian Surya Normal'}
        </span>
        <span>Nominal: 12.6V</span>
      </div>
    </div>
  );
}
