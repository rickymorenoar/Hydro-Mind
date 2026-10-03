'use client';

import type { NotifLogEntry } from '@/types/hydromind';

interface NotificationTableProps {
  notifications: NotifLogEntry[];
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari yang lalu`;
}

export default function NotificationTable({ notifications }: NotificationTableProps) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 text-slate-300">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Tidak ada catatan insiden atau anomali sistem (Semua parameter beroperasi normal).
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4 w-44">Kategori Peringatan</th>
              <th className="py-3 px-4">Deskripsi Diagnostik Sistem</th>
              <th className="py-3 px-4 w-44">Waktu Kejadian</th>
              <th className="py-3 px-4 w-28 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifications.map((n, i) => {
              const isClog = n.type === 'CLOG_OR_PUMP_FAIL';
              return (
                <tr key={n.id || i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {i + 1}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isClog
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isClog ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {isClog ? 'Kerusakan Pompa / Pipa' : 'Baterai Surya Rendah'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {n.message}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    <div className="text-slate-700">{timeAgo(n.created_at)}</div>
                    <div className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Tercatat
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
