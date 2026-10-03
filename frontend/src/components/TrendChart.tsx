'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { HistoryPoint } from '@/types/hydromind';

interface TrendChartProps {
  data: HistoryPoint[];
  label: string;
  color: string;
  unit: string;
  sublabel?: string;
}

function formatTime(isoString: string) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDate(isoString: any) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function TrendChart({
  data,
  label,
  color,
  unit,
  sublabel,
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 text-slate-300">
          <path d="M3 3v18h18M19 9l-5 5-4-4-3 3" />
        </svg>
        Tidak ada data riwayat telemetri dalam rentang waktu ini.
      </div>
    );
  }

  // Calculate stats: min, max, avg, latest
  const values = data.map((d) => d.value).filter((v) => typeof v === 'number' && !isNaN(v));
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const avgVal = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const latestVal = values.length ? values[values.length - 1] : 0;

  const gradId = `gradient-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h4 className="font-semibold text-sm text-slate-900">{label}</h4>
          {sublabel && <p className="text-[11px] text-slate-500">{sublabel}</p>}
        </div>

        {/* Industrial KPI summary chips */}
        <div className="flex items-center gap-3 font-mono text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400 mr-1">Terkini:</span>
            <span className="font-bold text-slate-800">{latestVal.toFixed(1)}{unit}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400 mr-1">Rata²:</span>
            <span className="font-semibold text-slate-700">{avgVal.toFixed(1)}{unit}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-slate-400 mr-1">Min / Max:</span>
            <span className="text-slate-700">{minVal.toFixed(1)} / {maxVal.toFixed(1)}{unit}</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="created_at"
              tickFormatter={formatTime}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'monospace' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              labelFormatter={(value: any) => formatDate(value)}
              formatter={(value: any) => [`${Number(value || 0).toFixed(2)} ${unit}`, label]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
