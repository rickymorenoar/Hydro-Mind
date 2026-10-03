'use client';

import { useState } from 'react';

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<{ id: number; api_key: string }>;
}

export default function AddDeviceModal({ open, onClose, onSubmit }: AddDeviceModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: number; api_key: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await onSubmit(name.trim());
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal mendaftarkan unit device baru.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setResult(null);
    setCopied(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        {!result ? (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Registrasi Unit HydroMind Baru</h3>
                <p className="text-xs text-slate-500">Tambahkan greenhouse / unit IoT baru ke server</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Label Unit / Lokasi
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Greenhouse Mini Blok A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Sistem akan otomatis mengalokasikan API Key unik untuk firmware ESP32 unit ini.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Mendaftarkan Unit...' : 'Buat Unit Device'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <h3 className="text-base font-bold">Unit Berhasil Didaftarkan!</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Salin <strong>API Key</strong> ini dan tempelkan pada konfigurasi firmware ESP32 unit tersebut. Key ini hanya ditampilkan penuh saat ini saja.
            </p>

            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl mb-4 font-mono text-xs">
              <span className="text-[10px] text-slate-400 block mb-1">HEADER X-API-KEY:</span>
              <code className="block break-all text-emerald-400 font-semibold select-all">
                {result.api_key}
              </code>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                {copied ? 'Tersalin!' : 'Salin API Key'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
