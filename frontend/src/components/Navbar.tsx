'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Device } from '@/types/hydromind';
import { getDevices } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

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
        { label: 'Overview', href: `/devices/${activeDeviceId}`, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { label: 'Kontrol & Pengaturan', href: `/devices/${activeDeviceId}/settings`, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        { label: 'Riwayat & Grafik', href: `/devices/${activeDeviceId}/history`, icon: 'M3 3v18h18 M19 9l-5 5-4-4-3 3' },
        { label: 'Log Notifikasi', href: `/devices/${activeDeviceId}/notifications`, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Panduan Sistem
              </Link>

              {/* ADMIN-ONLY NAVIGATION LINK */}
              {role === 'admin' && (
                <Link
                  href="/users"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/users'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50/50'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={link.icon} />
                      </svg>
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
                  <span className="text-[10px] font-mono">
                    {user.role === 'admin' && <span className="text-indigo-600 font-bold">👑 Admin</span>}
                    {user.role === 'operator' && <span className="text-sky-600 font-bold">🛠️ Operator</span>}
                    {user.role === 'member' && <span className="text-emerald-600 font-bold">👁️ Member</span>}
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  title="Keluar dari akun"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
                <span>Masuk</span>
              </Link>
            )}

            {/* Back to all units button if inside device */}
            {isInsideDevice && (
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Semua Unit
              </Link>
            )}

            {/* Smooth Animated Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle navigation"
            >
              <div className="relative flex h-4 w-5 flex-col justify-between">
                <span
                  className={`h-0.5 w-full bg-slate-700 rounded-full transition-all duration-300 ease-in-out transform ${
                    mobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-slate-700 rounded-full transition-all duration-200 ease-in-out ${
                    mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-slate-700 rounded-full transition-all duration-300 ease-in-out transform ${
                    mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Smooth Expandable Mobile Dropdown Menu Container */}
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
                  <span className="text-[10px] font-mono text-slate-500">
                    Role: <span className="uppercase font-bold text-emerald-700">{user.role}</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100"
                >
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Panduan Sistem & Spesifikasi
                </Link>

                {role === 'admin' && (
                  <Link
                    href="/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/users'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Kelola Pengguna (Admin)
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={link.icon} />
                        </svg>
                        {link.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 flex items-center justify-center gap-1.5 text-center px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors mt-1"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
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

