'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>('/logo-smenda.webp');

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Silakan isi email dan kata sandi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[380px] bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-3.5 my-auto">
      
      {/* Compact Header Branding */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200 shadow-2xs">
          <img
            src={logoSrc}
            alt="Logo SMKN 2 Buduran"
            className="h-full w-full object-contain p-0.5"
            onError={() => {
              if (logoSrc === '/logo-smenda.webp') setLogoSrc('/logo.png');
              else if (logoSrc === '/logo.png') setLogoSrc('/logo.svg');
            }}
          />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              HydroMind
            </h1>
            <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-700 border border-emerald-200">
              SMKN 2 Buduran
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Smart Greenhouse IoT Portal
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
          <span className="flex-1 text-[11px] leading-tight">{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="email">
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@hydromind.local"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 cursor-pointer transition-colors"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <span>Masuk Dashboard</span>
              <LogIn className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation & Security */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Sesi Terenkripsi</span>
        </div>
        <Link
          href="/"
          className="text-slate-500 hover:text-emerald-700 font-medium transition-colors"
        >
          Lihat Unit →
        </Link>
      </div>
    </div>
  );
}
