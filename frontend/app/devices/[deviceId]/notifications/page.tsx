'use client';

import { use, useEffect, useState } from 'react';
import NotificationTable from '@/components/NotificationTable';
import type { NotifLogEntry } from '@/types/hydromind';
import { getNotifications } from '@/lib/apiClient';

export default function DeviceNotificationsPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const resolvedParams = use(params);
  const deviceId = parseInt(resolvedParams.deviceId, 10);

  const [notifications, setNotifications] = useState<NotifLogEntry[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'CLOG_OR_PUMP_FAIL' | 'LOW_BATTERY'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getNotifications(deviceId)
      .then((res) => {
        if (isMounted) {
          const list = res?.data || (Array.isArray(res) ? res : []);
          setNotifications(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotifications([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [deviceId]);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Notifications Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900">Log Diagnostik & Notifikasi Anomali</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Riwayat peringatan otomatis: kerusakan pompa/pipa tersumbat dan status baterai kritis
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1 self-start sm:self-auto shadow-2xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('CLOG_OR_PUMP_FAIL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterType === 'CLOG_OR_PUMP_FAIL'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pompa / Pipa
          </button>
          <button
            type="button"
            onClick={() => setFilterType('LOW_BATTERY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterType === 'LOW_BATTERY'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Baterai Rendah
          </button>
        </div>
      </div>

      {/* Table / Cards Section */}
      {loading ? (
        <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
      ) : (
        <NotificationTable notifications={filteredNotifications} />
      )}
    </div>
  );
}
