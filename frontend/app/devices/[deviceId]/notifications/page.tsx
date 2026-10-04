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
    <div className="space-y-6">
      {/* Notifications Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-base text-slate-900">Log Diagnostik & Notifikasi Masalah</h2>
          <p className="text-xs text-slate-500">
            Riwayat peringatan otomatis: kegagalan pompa/pipa tersumbat dan status baterai surya kritis
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterType === 'LOW_BATTERY'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Baterai Rendah
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
      ) : (
        <NotificationTable notifications={filteredNotifications} />
      )}
    </div>
  );
}
