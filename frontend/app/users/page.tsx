'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, createUser, deleteUser } from '@/lib/apiClient';
import type { User, UserRole } from '@/types/hydromind';
import Link from 'next/link';

export default function UsersManagementPage() {
  const { user: currentUser, role, isAuthenticated, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Add User
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Gagal mengambil data user.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && role === 'admin') {
      fetchUserList();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [role, authLoading]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setModalError('Semua kolom wajib diisi.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      await createUser({ name, email, password, role: userRole });
      setToast({ type: 'success', text: `User "${name}" dengan role ${userRole.toUpperCase()} berhasil dibuat.` });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setUserRole('member');
      fetchUserList();
    } catch (err: any) {
      setModalError(err.message || 'Gagal menambahkan user baru.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (currentUser?.id === userToDelete.id) {
      setToast({ type: 'error', text: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userToDelete.name}" (${userToDelete.email})?`)) {
      return;
    }

    try {
      await deleteUser(userToDelete.id);
      setToast({ type: 'success', text: `User "${userToDelete.name}" berhasil dihapus.` });
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Gagal menghapus user.' });
    }
  };

  // State 1: Checking Authentication
  if (authLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Memeriksa hak akses autentikasi...</p>
      </div>
    );
  }

  // State 2: Not Logged In
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold">
          🔒
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Autentikasi Diperlukan</h2>
          <p className="text-xs text-slate-500 mt-1">
            Anda harus masuk sebagai Administrator untuk mengakses halaman Manajemen Pengguna.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs transition-all"
        >
          <span>Masuk Sekarang</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  // State 3: Logged In, but NOT Admin (Operator / Member)
  if (role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold">
          ⛔
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Akses Ditolak (403 Forbidden)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Akun Anda saat ini memiliki role <strong className="uppercase text-slate-800 font-mono">[{role}]</strong>.
            Halaman Manajemen Pengguna hanya dapat diakses oleh akun dengan role <strong className="text-indigo-600 font-mono">ADMIN</strong>.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Hak Akses Role Anda Saat Ini:</p>
          {role === 'operator' ? (
            <p className="text-[11px] text-slate-500">
              • Operator: Mengatur ambang batas kelembapan dan mode kerja pompa. (Tidak dapat menambah/menghapus user).
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              • Member: Melihat telemetri, grafik kelembapan, dan statistik greenhouse. (Mode baca saja).
            </p>
          )}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // State 4: ADMIN User - Full Access
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs border ${
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
            className="text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Pengguna & Hak Akses (RBAC)
            </h1>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700 border border-indigo-200">
              Admin Area
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun sistem dan batasan peran: Admin (Penuh), Operator (Pengaturan), dan Member (Lihat Saja).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah User Baru
        </button>
      </div>

      {/* Role Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900">👑 Role: Admin</span>
            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">FULL</span>
          </div>
          <p className="text-[11px] text-indigo-700/80 leading-relaxed">
            Akses total: Tambah/hapus user, ubah mode AUTO/MANUAL, atur ambang histeresis, dan kontrol saklar pompa manual.
          </p>
        </div>

        <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900">🛠️ Role: Operator</span>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">SETTING</span>
          </div>
          <p className="text-[11px] text-sky-700/80 leading-relaxed">
            Akses operasional: Dapat mengubah mode kerja dan batas kelembapan tanah, tetapi <span className="font-semibold">tidak dapat menambah/menghapus user</span>.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">👁️ Role: Member</span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">READ ONLY</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 leading-relaxed">
            Akses monitoring: Hanya dapat melihat statistik sensor, grafik telemetri, dan status unit. Tidak dapat mengubah konfigurasi.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Daftar Pengguna Terdaftar ({users.length})</h2>
          <button
            onClick={fetchUserList}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat daftar user...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Belum ada user yang terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Nama Pengguna</th>
                  <th className="px-5 py-3">Alamat Email</th>
                  <th className="px-5 py-3">Peran / Role</th>
                  <th className="px-5 py-3">Terdaftar Sejak</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-mono text-slate-700 font-bold">
                            Akun Anda
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">{u.email}</td>
                      <td className="px-5 py-3.5">
                        {u.role === 'admin' && (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
                            👑 Admin
                          </span>
                        )}
                        {u.role === 'operator' && (
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 border border-sky-200 inline-flex items-center gap-1">
                            🛠️ Operator
                          </span>
                        )}
                        {u.role === 'member' && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            👁️ Member
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-slate-400 italic">Aktif</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="text-rose-600 hover:text-rose-800 font-semibold text-xs px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah User Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah User Baru</h3>
                <p className="text-xs text-slate-500">Daftarkan akun dan tetapkan hak aksesnya</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="newName">
                  Nama Lengkap
                </label>
                <input
                  id="newName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="newEmail">
                  Email
                </label>
                <input
                  id="newEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@hydromind.local"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="newPassword">
                  Password (Minimal 6 karakter)
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Peran / Role (RBAC)
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="member">Member — Hanya Melihat Statistik & Grafik</option>
                  <option value="operator">Operator — Mengatur Ambang Batas & Mode Kerja</option>
                  <option value="admin">Admin — Kontrol Penuh Termasuk Manajemen User</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
