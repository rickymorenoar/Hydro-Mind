'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Device } from '@/types/hydromind';
import { getDevices } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutGrid,
  BookOpen,
  Users,
  Activity,
  Sliders,
  LineChart,
  Bell,
  LogOut,
  LogIn,
  ArrowLeft,
  Crown,
  Wrench,
  Eye,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, logout } = useAuth();

  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>('/logo-smenda.webp');

  // Check if user is currently inside a device dashboard view
  const isInsideDevice = pathname.startsWith('/devices/');

  // Extract deviceId from URL if inside a device
  useEffect(() => {
    const match = pathname.match(/\/devices\/(\d+)/);
    if (match && match[1]) {
      setActiveDeviceId(parseInt(match[1], 10));
    }
  }, [pathname]);

  // Fetch real devices from backend only if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setDevices([]);
      return;
    }
    getDevices()
      .then((data) => {
        if (Array.isArray(data)) {
          setDevices(data);
          if (!pathname.startsWith('/devices/') && data.length > 0) {
            setActiveDeviceId(data[0].id);
          }
        }
      })
      .catch(() => {
        setDevices([]);
      });
  }, [pathname, isAuthenticated]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = parseInt(e.target.value, 10);
    setActiveDeviceId(newId);

    if (pathname.includes('/devices/')) {
      const subpath = pathname.replace(/\/devices\/\d+/, '');
      router.push(`/devices/${newId}${subpath}`);
    } else {
      router.push(`/devices/${newId}`);
    }
  };

  const deviceTabs = activeDeviceId
    ? [
        { label: 'Overview', href: `/devices/${activeDeviceId}`, icon: Activity },
        { label: 'Kontrol & Pengaturan', href: `/devices/${activeDeviceId}/settings`, icon: Sliders },
        { label: 'Riwayat & Grafik', href: `/devices/${activeDeviceId}/history`, icon: LineChart },
        { label: 'Log Notifikasi', href: `/devices/${activeDeviceId}/notifications`, icon: Bell },
      ]
    : [];

  const currentDevice = devices.find((d) => d.id === activeDeviceId);

  if (pathname === '/login' || !isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* School / Institution Custom Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Photo / Image Logo Container */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-200 shadow-2xs group-hover:border-emerald-500 transition-colors">
                <img
                  src={logoSrc}
                  alt="Logo SMKN 2 Buduran"
                  className="h-full w-full object-contain p-0.5"
                  onError={() => {
                    if (logoSrc === '/logo-smenda.webp') {
                      setLogoSrc('/logo.png');
                    } else if (logoSrc === '/logo.png') {
                      setLogoSrc('/logo.svg');
                    }
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base group-hover:text-emerald-700 transition-colors">
                    HydroMind
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 border border-emerald-200">
                    SMKN 2 Buduran
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none">Smart Greenhouse Telemetry</p>
              </div>
            </Link>
          </div>

          {/* ========================================================= */}
          {/* CASE A: USER IS ON INITIAL / HOME / GUIDE / USERS PAGE    */}
          {/* Shows: "Daftar Unit", "Panduan Sistem", and Admin "Users"  */}
          {/* All styled consistently with standard emerald highlight   */}
          {/* ========================================================= */}
          {!isInsideDevice && (
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Daftar Unit ({devices.length})
              </Link>

              <Link
                href="/guide"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/guide'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Panduan Sistem
              </Link>

              {/* ADMIN-ONLY NAVIGATION LINK - Consistent styling */}
              {role === 'admin' && (
                <Link
                  href="/users"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/users'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Kelola Pengguna
                </Link>
              )}
            </nav>
          )}

          {/* ========================================================= */}
          {/* CASE B: USER IS INSIDE A DEVICE VIEW                      */}
          {/* Shows: Device Switcher & Full Navigation Tabs             */}
          {/* ========================================================= */}
          {isInsideDevice && (
            <>
              {/* Unit Dropdown Selector */}
              {devices.length > 0 && (
                <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                  <div className="flex items-center gap-2 pl-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${currentDevice?.is_online ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-400'}`} />
                    <span className="text-xs font-medium text-slate-500">Unit:</span>
                  </div>
                  <select
                    value={activeDeviceId || ''}
                    onChange={handleDeviceChange}
                    className="bg-white text-slate-800 text-xs font-semibold rounded-md border border-slate-300 py-1 pl-2.5 pr-7 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.is_online ? 'Online' : 'Offline'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Full Device Navigation Tabs */}
              <nav className="hidden lg:flex items-center gap-1">
                {deviceTabs.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}

          {/* Right Header: User Profile & Actions */}
          <div className="flex items-center gap-2.5">
            {/* User Profile / Login Button */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end text-right leading-tight">
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                  <span className="text-[10px] font-mono flex items-center gap-1">
                    {user.role === 'admin' && (
                      <span className="text-indigo-700 font-bold inline-flex items-center gap-1">
                        <Crown className="w-3 h-3 text-indigo-600" /> Admin
                      </span>
                    )}
                    {user.role === 'operator' && (
                      <span className="text-sky-700 font-bold inline-flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-sky-600" /> Operator
                      </span>
                    )}
                    {user.role === 'member' && (
                      <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-600" /> Member
                      </span>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  title="Keluar dari akun"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            )}

            {/* Back to all units button if inside device */}
            {isInsideDevice && (
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Semua Unit
              </Link>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Container */}
        <div
          className={`md:hidden grid transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? 'grid-rows-[1fr] opacity-100 border-t border-slate-200 py-3'
              : 'grid-rows-[0fr] opacity-0 py-0 border-transparent pointer-events-none'
          }`}
        >
          <div className="overflow-hidden space-y-2.5 transition-transform duration-300 ease-in-out">
            {/* User status for mobile */}
            {isAuthenticated && user && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{user.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                    Role: <span className="uppercase font-bold text-emerald-700">{user.role}</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            )}

            {!isInsideDevice ? (
              <div className="space-y-1.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Daftar Unit ({devices.length} Unit)
                </Link>
                <Link
                  href="/guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/guide'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Panduan Sistem & Spesifikasi
                </Link>

                {role === 'admin' && (
                  <Link
                    href="/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/users'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Kelola Pengguna
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {devices.length > 0 && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 block">Pilih Unit:</span>
                    <select
                      value={activeDeviceId || ''}
                      onChange={(e) => {
                        handleDeviceChange(e);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 py-2 px-3 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                    >
                      {devices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.is_online ? 'Online' : 'Offline'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  {deviceTabs.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 flex items-center justify-center gap-1.5 text-center px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors mt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Kembali ke Semua Unit
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
