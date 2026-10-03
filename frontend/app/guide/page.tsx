'use client';

import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <span>📚 Dokumentasi & Petunjuk Penggunaan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Panduan Sistem & Arsitektur HydroMind
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          HydroMind (<em>Intelligent Water Management System for Smart Greenhouse</em>) adalah ekosistem IoT otomatisasi penyiraman tanaman presisi berbasis kelembapan tanah dengan catu daya mandiri tenaga surya.
        </p>
      </div>

      {/* 1. Cara Kerja Sistem */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold">1</span>
          Logika Operasi Otonom & Mode Kontrol
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-emerald-700 text-sm block">Mode Otomatis (AUTO)</span>
            <p className="text-slate-600 leading-relaxed">
              Mikrokontroler ESP32 membaca kelembapan tanah dari sensor kapasitif secara real-time.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono">
              <li>Kelembapan &lt; <strong>moisture_lower</strong> (default 40%): Pompa ON otomatis.</li>
              <li>Kelembapan &gt; <strong>moisture_upper</strong> (default 70%): Pompa OFF otomatis.</li>
              <li>Sensor Waterflow mengukur debit air (L/menit) untuk verifikasi.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-amber-700 text-sm block">Mode Manual Remote</span>
            <p className="text-slate-600 leading-relaxed">
              Operator dapat mengambil alih kendali pompa kapan saja melalui tombol ON/OFF di web dashboard.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono">
              <li>Perintah disimpan di antrian server Laravel.</li>
              <li>ESP32 mengambil perintah saat polling `GET /api/device/command`.</li>
              <li>Relay dieksekusi langsung sesuai instruksi tombol manual.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Spesifikasi Hardware Node ESP32 */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold">2</span>
          Spesifikasi Hardware & Sensor Perangkat (Tabel 3.1)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <th className="py-2.5 px-3">Komponen</th>
                <th className="py-2.5 px-3">Peran dalam Sistem</th>
                <th className="py-2.5 px-3">Tampilan di Dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">ESP32 DevKit V1</td>
                <td className="py-2 px-3 text-slate-600">Mikrokontroler utama: WiFi, ADC 12-bit, PWM</td>
                <td className="py-2 px-3 font-mono text-slate-500">Status Online / Offline</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Sensor Kelembapan Kapasitif</td>
                <td className="py-2 px-3 text-slate-600">Mendeteksi kadar air pada media tanam (%)</td>
                <td className="py-2 px-3 font-mono text-emerald-700">soil_moisture (Gauge chart)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Sensor DHT22</td>
                <td className="py-2 px-3 text-slate-600">Memantau suhu (°C) & kelembapan udara (%RH)</td>
                <td className="py-2 px-3 font-mono text-slate-700">air_temp, air_humidity</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Sensor Waterflow (YF-S201)</td>
                <td className="py-2 px-3 text-slate-600">Mengukur debit air (L/menit) & deteksi sumbatan</td>
                <td className="py-2 px-3 font-mono text-sky-700">water_flow (L/m)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Mini Submersible Pump 5V + Relay</td>
                <td className="py-2 px-3 text-slate-600">Aktuator penyiraman tanaman presisi</td>
                <td className="py-2 px-3 font-mono text-slate-700">pump_status (ON/OFF)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Panel Surya + Baterai Li-ion 3S</td>
                <td className="py-2 px-3 text-slate-600">Catu daya mandiri: 9.0V - 12.6V via SCC</td>
                <td className="py-2 px-3 font-mono text-amber-700">battery_level, battery_voltage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Endpoint REST API ESP32 */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold">3</span>
          Protokol REST API Gateway (Header X-API-KEY)
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 font-mono">
            <span className="text-emerald-400 font-bold block">1. Kirim Data Sensor (POST /api/device/data)</span>
            <pre className="text-[11px] text-slate-300 overflow-x-auto">
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

          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 font-mono">
            <span className="text-sky-400 font-bold block">2. Ambil Perintah Server (GET /api/device/command)</span>
            <pre className="text-[11px] text-slate-300 overflow-x-auto">
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

      {/* Quick CTA to return to unit list */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <span className="text-slate-600 font-medium">Siap memantau data greenhouse?</span>
        <Link
          href="/"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
        >
          Lihat Daftar Unit Greenhouse →
        </Link>
      </div>
    </div>
  );
}
