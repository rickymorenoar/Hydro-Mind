'use client';

import Link from 'next/link';

export default function GuidePage() {
  const databaseMapping = [
    { field: 'soil_moisture', func: 'Nilai kelembapan tanah (%)', ui: 'Gauge chart' },
    { field: 'air_temp', func: 'Suhu udara — DHT22 (°C)', ui: 'Angka real-time' },
    { field: 'air_humidity', func: 'Kelembapan udara — DHT22 (%RH)', ui: 'Angka real-time' },
    { field: 'pump_status', func: 'Status pompa (ON/OFF)', ui: 'Indikator ikon' },
    { field: 'water_flow', func: 'Debit air ke pompa (L/menit)', ui: 'Angka real-time' },
    { field: 'mode', func: 'Mode operasi (Otomatis/Manual)', ui: 'Toggle switch' },
    { field: 'pump_cmd', func: 'Perintah manual pompa (ON/OFF)', ui: 'Tombol' },
    { field: 'battery_level', func: 'Level baterai (%) hasil konversi tegangan', ui: 'Progress bar' },
    { field: 'battery_voltage', func: 'Tegangan baterai (V)', ui: 'Gauge chart' },
    { field: 'notif_log', func: 'Log notifikasi sistem', ui: 'Tabel log riwayat' },
  ];

  const hardwareItems = [
    { no: 1, component: 'ESP32 DevKit V1', role: 'Mikrokontroler utama: WiFi, Bluetooth, ADC 12-bit, PWM' },
    { no: 2, component: 'Sensor Kelembapan Tanah Kapasitif', role: 'Mendeteksi kadar air pada media tanam (input analog)' },
    { no: 3, component: 'Sensor DHT22', role: 'Memantau suhu & kelembapan udara di dalam greenhouse' },
    { no: 4, component: 'Sensor Waterflow (YF-S201)', role: 'Mengukur debit air ke pompa untuk verifikasi penyiraman & deteksi selang tersumbat' },
    { no: 5, component: 'Mini Submersible Water Pump 5 V + Selang', role: 'Aktuator penyiraman tanaman secara otomatis' },
    { no: 6, component: 'Modul Relay 1 Channel 5 V', role: 'Saklar pompa; mengisolasi sinyal GPIO ESP32 dari jalur daya pompa' },
    { no: 7, component: 'Solar Charge Controller (SCC)', role: 'Mengatur pengisian baterai dari panel surya serta memutus arus saat baterai penuh atau terlalu rendah' },
    { no: 8, component: 'Panel Surya Mini (2 unit, dipasang paralel)', role: 'Sumber energi utama sistem (energi terbarukan)' },
    { no: 9, component: 'Baterai Li-ion 18650 (3 sel, susunan 3S)', role: 'Penyimpanan energi sistem; tegangan kerja 9,0–12,6 V (nominal 11,1 V)' },
    { no: 10, component: 'Step-Down Converter (Buck Converter)', role: 'Menurunkan tegangan baterai ke 5 V/3,3 V untuk ESP32, sensor & pompa' },
    { no: 11, component: 'Saklar Utama', role: 'Proteksi hubung singkat dan pemutus daya manual saat perawatan' },
    { no: 12, component: 'PCB', role: 'Dudukan permanen jalur rangkaian elektronik' },
  ];

  const softwareItems = [
    { no: 1, component: 'Arduino IDE', role: 'Lingkungan pemrograman & pengunggahan firmware ke ESP32' },
    { no: 2, component: 'Bahasa C/C++', role: 'Bahasa pemrograman utama seluruh logika sistem' },
    { no: 3, component: 'Website Dashboard', role: 'Dashboard monitoring, kontrol jarak jauh, dan riwayat data tersimpan pada database milik sistem sendiri' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-semibold border border-emerald-200">
          <span>Hydro Mind Green House</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Dokumentasi Sistem, Database & Hardware HydroMind
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong>HYDROMIND: Intelligent Water Management System for Smart Greenhouse Berbasis Mobile Web</strong> oleh Tim <strong>RA-RISA CONNECT</strong> (SMK Negeri 2 Buduran Sidoarjo).
        </p>
      </div>

      {/* 1. Pemetaan Database (Tabel 5.1 Proposal) */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px] sm:text-xs font-bold">1</span>
            Pemetaan Data ke Database pada Sistem HydroMind
          </h2>
        
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {databaseMapping.map((item, idx) => (
            <div key={idx} className="py-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                  {item.field}
                </span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                  {item.ui}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{item.func}</p>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <th className="py-2.5 px-3 font-mono">FIELD DATABASE</th>
                <th className="py-2.5 px-3">DATA / FUNGSI</th>
                <th className="py-2.5 px-3">TAMPILAN DI WEBSITE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {databaseMapping.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.field}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.func}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">{item.ui}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Spesifikasi Hardware (Tabel 3.1 Proposal) */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px] sm:text-xs font-bold">2</span>
            Spesifikasi Hardware HydroMind
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">12 Komponen Sistem</span>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {hardwareItems.map((item) => (
            <div key={item.no} className="py-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 flex items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600 shrink-0">
                  {item.no}
                </span>
                <span className="font-bold text-slate-900">{item.component}</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">{item.role}</p>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <th className="py-2.5 px-3 w-12 text-center">NO</th>
                <th className="py-2.5 px-3">KOMPONEN</th>
                <th className="py-2.5 px-3">FUNGSI DALAM SISTEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {hardwareItems.map((item) => (
                <tr key={item.no} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-center text-slate-400 font-semibold">{item.no}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.component}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Spesifikasi Software (Tabel 3.2 Proposal) */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px] sm:text-xs font-bold">3</span>
          Spesifikasi Software HydroMind
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <th className="py-2.5 px-3 w-12 text-center">NO</th>
                <th className="py-2.5 px-3">PERANGKAT LUNAK / LIBRARY</th>
                <th className="py-2.5 px-3">FUNGSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {softwareItems.map((item) => (
                <tr key={item.no}>
                  <td className="py-2.5 px-3 font-mono text-center text-slate-400 font-semibold">{item.no}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.component}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Endpoint REST API Gateway */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-5 sm:h-6 w-5 sm:w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px] sm:text-xs font-bold">4</span>
          Protokol REST API Gateway (Header X-API-KEY)
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 sm:p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 font-mono">
            <span className="text-emerald-400 font-bold block text-[11px]">1. Kirim Data Sensor (POST /api/device/data)</span>
            <pre className="text-[10px] text-slate-300 overflow-x-auto">
{`// Header: X-API-KEY: [YOUR_DEVICE_API_KEY]
{
  "soil_moisture": 55.2,
  "air_temp": 29.4,
  "air_humidity": 68.1,
  "pump_status": "ON",
  "water_flow": 1.2,
  "battery_level": 82.0,
  "battery_voltage": 11.9
}`}
            </pre>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 font-mono">
            <span className="text-sky-400 font-bold block text-[11px]">2. Ambil Perintah Server (GET /api/device/command)</span>
            <pre className="text-[10px] text-slate-300 overflow-x-auto">
{`// Header: X-API-KEY: [YOUR_DEVICE_API_KEY]
// Response dari server:
{
  "mode": "AUTO",
  "pump_cmd": "OFF",
  "moisture_lower": 40,
  "moisture_upper": 70
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* CTA to return to unit list */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <span className="text-slate-600 font-medium text-center sm:text-left">Siap memantau data greenhouse?</span>
        <Link
          href="/"
          className="w-full sm:w-auto text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
        >
          Lihat Daftar Perangkat Greenhouse →
        </Link>
      </div>
    </div>
  );
}
