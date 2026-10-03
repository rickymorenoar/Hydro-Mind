'use client';

interface PumpStatusBadgeProps {
  status: 'ON' | 'OFF';
  flowRate?: number;
}

export default function PumpStatusBadge({ status, flowRate = 0 }: PumpStatusBadgeProps) {
  const isOn = status === 'ON';

  return (
    <div className="flex flex-col items-center justify-between p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
      <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
        <span>Aktuator Pompa Submersible</span>
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
            isOn
              ? 'bg-sky-500 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          Relay: {status}
        </span>
      </div>

      <div className="flex items-center gap-4 my-2">
        {/* Pump icon */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-all ${
            isOn
              ? 'bg-sky-50 border-sky-300 text-sky-600 shadow-xs'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-500">Sensor Waterflow</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className={`text-2xl font-bold ${isOn ? 'text-sky-700' : 'text-slate-800'}`}>
              {flowRate.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">L/menit</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {isOn ? 'Air Mengalir Menuju Nozzle' : 'Katup Aliran Tertutup'}
          </span>
        </div>
      </div>

      <div className="w-full text-center py-1 bg-white rounded border border-slate-200/60 text-[11px] font-mono text-slate-600">
        {isOn ? '● Status: Menyiram Tanaman' : '○ Status: Standby Siaga'}
      </div>
    </div>
  );
}
