'use client';

interface GaugeCardProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  targetRange?: { min: number; max: number; label?: string };
  colorScheme?: 'emerald' | 'sky' | 'amber' | 'solar';
}

export default function GaugeCard({
  label,
  value,
  min,
  max,
  unit,
  targetRange,
  colorScheme = 'emerald',
}: GaugeCardProps) {
  const radius = 68;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // 180 degree semi-circle
  const clamped = Math.max(min, Math.min(max, value));
  const percent = ((clamped - min) / (max - min)) * 100;
  const dashOffset = circumference * (1 - percent / 100);

  // Determine active color stroke
  let strokeColor = '#10b981'; // emerald-500
  if (colorScheme === 'solar') {
    strokeColor = clamped < 10.0 ? '#f43f5e' : clamped < 11.5 ? '#f59e0b' : '#10b981';
  } else if (colorScheme === 'emerald') {
    strokeColor = clamped < 40 ? '#f59e0b' : clamped > 75 ? '#0ea5e9' : '#10b981';
  } else if (colorScheme === 'sky') {
    strokeColor = '#0ea5e9';
  }

  return (
    <div className="flex flex-col items-center justify-between p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
      <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
        <span>{label}</span>
        {targetRange && (
          <span className="text-[10px] bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
            Target: {targetRange.min}–{targetRange.max}{unit}
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-center my-1">
        <svg width="170" height="95" viewBox="0 0 170 95" className="overflow-visible">
          {/* Background meter track */}
          <path
            d="M 15,85 A 68,68 0 0,1 155,85"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active progress arc */}
          <path
            d="M 15,85 A 68,68 0 0,1 155,85"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500 ease-out"
          />

          {/* Center text value */}
          <text
            x="85"
            y="74"
            textAnchor="middle"
            className="fill-slate-900 font-mono font-bold text-2xl"
          >
            {clamped.toFixed(1)}
          </text>
          <text
            x="85"
            y="90"
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[11px] font-medium"
          >
            {unit}
          </text>
        </svg>
      </div>

      {/* Min - Max Scale Indicators */}
      <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 px-3">
        <span>{min}{unit}</span>
        <span className="text-slate-500 font-medium">{percent.toFixed(0)}% Rentang</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
