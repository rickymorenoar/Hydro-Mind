# CLAUDE.md — HydroMind Dashboard

Dokumen ini adalah acuan utama untuk membangun **website dashboard HydroMind**. Spesifikasi teknis diambil dari proposal "HydroMind: Intelligent Water Management System for Smart Greenhouse" (Tim RA-RISA CONNECT, SMKN 2 Buduran — Lomba IoT 2026), dengan dua perluasan: (1) dashboard mendukung **lebih dari satu unit HydroMind sekaligus**, dan (2) backend dibangun dengan **Laravel**, terpisah dari frontend. Ikuti spesifikasi ini secara konsisten. Jika ada bagian yang ambigu, tanyakan dulu sebelum mengambil asumsi sendiri.

---

## 1. Ringkasan Proyek

**HydroMind** adalah *Intelligent Water Management System for Smart Greenhouse* — prototipe IoT untuk otomatisasi penyiraman tanaman berbasis kelembapan tanah, dengan catu daya mandiri dari energi surya.

Proyek ini terdiri dari dua bagian yang berkomunikasi lewat REST API:
- **Backend (Laravel):** menyimpan data, mengelola device, menyediakan seluruh endpoint API untuk ESP32 maupun dashboard.
- **Frontend (Next.js):** antarmuka dashboard yang dilihat pengguna, mengonsumsi API dari backend Laravel.

Dashboard mendukung **satu atau lebih unit HydroMind** — misalnya beberapa rumah kaca mini berbeda, masing-masing dengan ESP32, sensor, aktuator, dan catu dayanya sendiri. Setiap unit adalah satu "device" yang datanya terpisah, tapi dipantau lewat satu dashboard yang sama.

## 2. Spesifikasi Hardware & Software (Tabel 3.1 & 3.2 — referensi konteks)

Bagian ini tidak perlu diimplementasikan di kode, tapi wajib dipahami karena menentukan dari mana dan seperti apa data yang masuk ke sistem. **Setiap device yang terdaftar memiliki set hardware ini masing-masing.**

**Tabel 3.1 — Spesifikasi Hardware HydroMind**

| No | Komponen | Fungsi dalam Sistem |
|---|---|---|
| 1 | ESP32 DevKit V1 | Mikrokontroler utama: WiFi, Bluetooth, ADC 12-bit, PWM |
| 2 | Sensor Kelembapan Tanah Kapasitif | Mendeteksi kadar air pada media tanam (input analog) |
| 3 | Sensor DHT22 | Memantau suhu & kelembapan udara di dalam greenhouse |
| 4 | Sensor Waterflow (YF-S201) | Mengukur debit air ke pompa untuk verifikasi penyiraman & deteksi selang tersumbat |
| 5 | Mini Submersible Water Pump 5V + Selang | Aktuator penyiraman tanaman secara otomatis |
| 6 | Modul Relay 1 Channel 5V | Saklar pompa; mengisolasi sinyal GPIO ESP32 dari jalur daya pompa |
| 7 | Solar Charge Controller (SCC) | Mengatur pengisian baterai dari panel surya serta memutus arus saat baterai penuh/terlalu rendah |
| 8 | Panel Surya Mini (2 unit, paralel) | Sumber energi utama sistem |
| 9 | Baterai Li-ion 18650 (3S) | Penyimpanan energi; tegangan kerja 9,0–12,6 V (nominal 11,1 V) |
| 10 | Step-Down (Buck) Converter | Menurunkan tegangan baterai ke 5V/3,3V untuk ESP32, sensor & pompa |
| 11 | Saklar Utama | Proteksi hubung singkat & pemutus daya manual |
| 12 | PCB | Dudukan permanen jalur rangkaian elektronik |

**Tabel 3.2 — Spesifikasi Software HydroMind (disesuaikan dengan stack proyek ini)**

| No | Perangkat Lunak / Library | Fungsi |
|---|---|---|
| 1 | Arduino IDE | Lingkungan pemrograman & pengunggahan firmware ke ESP32 |
| 2 | Bahasa C/C++ | Bahasa pemrograman logika sistem di firmware |
| 3 | Laravel (PHP) | Backend REST API, autentikasi device, akses database |
| 4 | Next.js (TypeScript) | Frontend dashboard — **antarmuka yang dilihat pengguna** |

## 3. Tujuan Website

1. Menampilkan data sensor (kelembapan tanah, suhu, kelembapan udara, debit air, tegangan & level baterai) secara real-time, per device.
2. Menyediakan kontrol jarak jauh per device: beralih mode Otomatis/Manual, ON/OFF pompa secara manual.
3. Menyediakan pengaturan ambang batas kelembapan tanah per device.
4. Menampilkan riwayat data dan log notifikasi, per device.
5. Menjadi perantara komunikasi dua arah antara tiap ESP32 dan pengguna lewat REST API (backend Laravel).
6. Mendukung penambahan device baru kapan saja tanpa mengubah kode — cukup daftarkan device baru dari dashboard, dapatkan API key baru, pasang di firmware ESP32 device tersebut.

## 4. Tech Stack

| Layer | Pilihan |
|---|---|
| Backend | **Laravel 11 (PHP 8.2+)** |
| Database | MySQL |
| ORM | Eloquent (bawaan Laravel) + migrations |
| API | Laravel routes (`routes/api.php`), Controllers, Form Requests untuk validasi, API Resources untuk bentuk JSON response |
| Autentikasi device | API Key unik **per device**, dikirim via header `X-API-KEY`, divalidasi lewat custom middleware (bukan Sanctum — ini bukan login user biasa) |
| Autentikasi dashboard | Laravel Sanctum (token-based), cukup satu akun admin yang bisa mengelola semua device |
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Chart | Recharts (`RadialBarChart` untuk gauge, `LineChart` untuk tren) |
| Komunikasi frontend ↔ backend | Next.js melakukan `fetch` ke base URL API Laravel (`NEXT_PUBLIC_API_URL`), bukan API Routes internal Next.js |

## 5. Struktur Folder yang Diharapkan

**Pemisahan ini wajib tegas** — backend dan frontend harus bisa dicek, dijalankan, dan di-review secara terpisah satu sama lain, tanpa saling bergantung di luar komunikasi lewat REST API:

- Taruh di dua folder root yang jelas: `backend/` (Laravel) dan `frontend/` (Next.js) — jangan dicampur dalam satu folder `src/` bersama, dan jangan ada file yang di-share langsung antar keduanya (tidak ada folder `shared/` atau import lintas folder).
- Masing-masing punya dependency management sendiri: `backend/composer.json` untuk Laravel, `frontend/package.json` untuk Next.js — dua proses install terpisah (`composer install` dan `npm install`).
- Masing-masing punya `.env` sendiri (`backend/.env` dan `frontend/.env.local`) dan bisa dijalankan independen (`php artisan serve` di satu terminal, `npm run dev` di terminal lain) — frontend hanya butuh tahu `NEXT_PUBLIC_API_URL` untuk bisa bicara ke backend, tidak ada ketergantungan lain.
- Kalau dipakai Git, pertimbangkan dua repo terpisah, atau minimal pastikan histori commit dan `.gitignore` masing-masing folder independen agar mudah dipisah jadi repo sendiri nanti.

Dua folder terpisah dalam satu repo (atau dua repo, bebas dipilih agent, tapi strukturnya tetap dipisah backend/frontend):

```
hydromind/
├── CLAUDE.md
├── backend/                          # Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/Device/
│   │   │   │   │   ├── DataController.php       # POST data sensor
│   │   │   │   │   └── CommandController.php    # GET mode & pump_cmd
│   │   │   │   └── Api/Dashboard/
│   │   │   │       ├── DeviceController.php     # list/create device
│   │   │   │       ├── LatestController.php
│   │   │   │       ├── HistoryController.php
│   │   │   │       ├── NotificationController.php
│   │   │   │       └── SettingsController.php
│   │   │   ├── Middleware/
│   │   │   │   └── AuthenticateDeviceApiKey.php
│   │   │   ├── Requests/
│   │   │   │   ├── StoreReadingRequest.php
│   │   │   │   └── UpdateSettingsRequest.php
│   │   │   └── Resources/
│   │   │       ├── ReadingResource.php
│   │   │       └── DeviceResource.php
│   │   ├── Models/
│   │   │   ├── Device.php
│   │   │   ├── Reading.php
│   │   │   ├── Setting.php
│   │   │   └── NotifLog.php
│   │   └── Services/
│   │       └── NotificationRuleService.php       # logika deteksi selang tersumbat/baterai rendah
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       └── DeviceSeeder.php                   # minimal 2 device dummy
│   ├── routes/
│   │   └── api.php
│   └── .env.example
└── frontend/                          # Next.js
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                           # Daftar semua device
    │   │   └── devices/
    │   │       └── [deviceId]/
    │   │           ├── page.tsx                   # Overview device ini
    │   │           ├── settings/page.tsx
    │   │           ├── history/page.tsx
    │   │           └── notifications/page.tsx
    │   ├── components/
    │   │   ├── DeviceCard.tsx
    │   │   ├── DeviceSwitcher.tsx
    │   │   ├── GaugeCard.tsx
    │   │   ├── BatteryIndicator.tsx
    │   │   ├── PumpStatusBadge.tsx
    │   │   ├── ModeToggle.tsx
    │   │   ├── ThresholdForm.tsx
    │   │   ├── TrendChart.tsx
    │   │   └── NotificationTable.tsx
    │   ├── lib/
    │   │   └── apiClient.ts                        # wrapper fetch ke backend Laravel
    │   └── types/
    │       └── hydromind.ts
    ├── .env.local.example
    └── package.json
```

## 6. Pemetaan Data ke Database (Tabel 5.1 — WAJIB diikuti persis, per device)

Nama field database, arti data, dan cara tampil di website **harus persis** seperti tabel ini untuk setiap device — jangan diganti nama atau digabung field-nya. Setiap baris data terhubung ke satu `device_id`.

| Field Database | Data / Fungsi | Tampilan di Website |
|---|---|---|
| `soil_moisture` | Nilai kelembapan tanah (%) | Gauge chart |
| `air_temp` | Suhu udara — DHT22 (°C) | Angka real-time |
| `air_humidity` | Kelembapan udara — DHT22 (%RH) | Angka real-time |
| `pump_status` | Status pompa (ON/OFF) | Indikator ikon |
| `water_flow` | Debit air ke pompa (L/menit) | Angka real-time |
| `mode` | Mode operasi (Otomatis/Manual) | Toggle switch |
| `pump_cmd` | Perintah manual pompa (ON/OFF) | Tombol |
| `battery_level` | Level baterai (%) hasil konversi tegangan | Progress bar |
| `battery_voltage` | Tegangan baterai (V) | Gauge chart |
| `notif_log` | Log notifikasi sistem | Tabel log riwayat |

### Migrasi Laravel

```php
// database/migrations/xxxx_xx_xx_create_devices_table.php
Schema::create('devices', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('api_key')->unique();
    $table->timestamps();
});

// database/migrations/xxxx_xx_xx_create_readings_table.php
Schema::create('readings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('device_id')->constrained()->cascadeOnDelete();
    $table->float('soil_moisture');
    $table->float('air_temp');
    $table->float('air_humidity');
    $table->enum('pump_status', ['ON', 'OFF']);
    $table->float('water_flow');
    $table->float('battery_level');
    $table->float('battery_voltage');
    $table->timestamp('created_at')->useCurrent();
    $table->index(['device_id', 'created_at']);
});

// database/migrations/xxxx_xx_xx_create_settings_table.php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
    $table->enum('mode', ['AUTO', 'MANUAL'])->default('AUTO');
    $table->enum('pump_cmd', ['ON', 'OFF'])->default('OFF');
    $table->float('moisture_lower')->default(40);
    $table->float('moisture_upper')->default(70);
    $table->timestamps();
});

// database/migrations/xxxx_xx_xx_create_notif_log_table.php
Schema::create('notif_log', function (Blueprint $table) {
    $table->id();
    $table->foreignId('device_id')->constrained()->cascadeOnDelete();
    $table->enum('type', ['CLOG_OR_PUMP_FAIL', 'LOW_BATTERY']);
    $table->text('message');
    $table->timestamp('created_at')->useCurrent();
    $table->index(['device_id', 'created_at']);
});
```

### Model Eloquent (ringkas)

```php
// app/Models/Device.php
class Device extends Model
{
    protected $fillable = ['name', 'api_key'];
    public function readings() { return $this->hasMany(Reading::class); }
    public function setting() { return $this->hasOne(Setting::class); }
    public function notifLogs() { return $this->hasMany(NotifLog::class); }
}

// app/Models/Reading.php — $fillable sesuai field Tabel 5.1, belongsTo(Device::class)
// app/Models/Setting.php — $fillable: mode, pump_cmd, moisture_lower, moisture_upper, belongsTo(Device::class)
// app/Models/NotifLog.php — $fillable: type, message, belongsTo(Device::class)
```

Catatan penting:
- `Device` adalah tabel baru — satu baris per unit HydroMind fisik, menyimpan `name` (label bebas, mis. "Greenhouse Balkon 1") dan `api_key` unik.
- `Setting` satu baris per device (relasi 1:1 lewat `hasOne`/`belongsTo`), bukan singleton global.
- `Reading` dan `NotifLog` masing-masing punya `device_id` — semua query wajib difilter berdasarkan device.
- Saat device baru didaftarkan (`DeviceController@store`), buat juga baris `Setting` default (mode `AUTO`, ambang 40/70) via event/observer atau langsung di controller dalam satu transaksi.

## 7. Environment Variables

**Backend (`backend/.env`)** — mengikuti konvensi standar Laravel, ditambah:
```
APP_NAME=HydroMind
DB_CONNECTION=mysql
DB_DATABASE=hydromind
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:3000
FRONTEND_URL=http://localhost:3000
```
`api_key` per device **tidak disimpan di `.env`** — setiap device punya key sendiri di kolom `devices.api_key`, dibuat otomatis saat device didaftarkan (mis. `Str::random(40)`), bukan dihardcode.

**Frontend (`frontend/.env.local`)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 8. Spesifikasi API (disediakan backend Laravel, `routes/api.php`)

### 8.1 Endpoint untuk ESP32 (wajib header `X-API-KEY`, melalui middleware `AuthenticateDeviceApiKey`, identitas device dari key ini)

```php
// routes/api.php
Route::middleware('device.auth')->prefix('device')->group(function () {
    Route::post('/data', [Api\Device\DataController::class, 'store']);
    Route::get('/command', [Api\Device\CommandController::class, 'show']);
});
```

**`POST /api/device/data`**

```json
{
  "soil_moisture": 55.2,
  "air_temp": 29.4,
  "air_humidity": 68.1,
  "pump_status": "ON",
  "water_flow": 1.2,
  "battery_level": 82,
  "battery_voltage": 11.9
}
```

Perilaku server (`DataController@store`, divalidasi dengan `StoreReadingRequest`):
1. Middleware `AuthenticateDeviceApiKey` mencocokkan `X-API-KEY` ke satu baris `devices`. Tidak ditemukan → `401 Unauthorized`.
2. Simpan sebagai baris baru di `readings`, terhubung ke `device_id` yang ditemukan.
3. `NotificationRuleService` mengecek: jika `pump_status == ON` dan `water_flow == 0` → insert `notif_log` tipe `CLOG_OR_PUMP_FAIL` (sesuai proposal Bagian 4.1).
4. Jika `battery_level` di bawah ambang rendah (mis. < 20%) → insert `notif_log` tipe `LOW_BATTERY`. Cegah duplikasi notifikasi sejenis untuk device yang sama dalam interval singkat (mis. 10 menit) — cek lewat query `where('created_at', '>=', now()->subMinutes(10))` sebelum insert.
5. Response: `200 OK`, `{ "status": "ok" }`.

**`GET /api/device/command`** — dipanggil tiap ESP32 tiap 1 menit.

```json
{
  "mode": "MANUAL",
  "pump_cmd": "ON",
  "moisture_lower": 40,
  "moisture_upper": 70
}
```

### 8.2 Endpoint untuk Dashboard (autentikasi Sanctum)

```php
Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {
    Route::get('/devices', [Api\Dashboard\DeviceController::class, 'index']);
    Route::post('/devices', [Api\Dashboard\DeviceController::class, 'store']);
    Route::get('/devices/{device}/latest', [Api\Dashboard\LatestController::class, 'show']);
    Route::get('/devices/{device}/history', [Api\Dashboard\HistoryController::class, 'index']);
    Route::get('/devices/{device}/notifications', [Api\Dashboard\NotificationController::class, 'index']);
    Route::post('/devices/{device}/settings', [Api\Dashboard\SettingsController::class, 'update']);
});
```

Gunakan **route model binding** (`{device}`) supaya Laravel otomatis mengembalikan `404` kalau device tidak ditemukan.

**`GET /api/dashboard/devices`** — daftar semua device + ringkasan status terakhir masing-masing.

**`POST /api/dashboard/devices`** — daftarkan device baru.
```json
{ "name": "Greenhouse Balkon 1" }
```
Response mengembalikan `id` device dan `api_key` baru (satu-satunya kesempatan key ditampilkan penuh; setelahnya tampilkan tersamar, mis. `••••1a2b`).

**`GET /api/dashboard/devices/{device}/latest`**
```json
{
  "soil_moisture": 55.2,
  "air_temp": 29.4,
  "air_humidity": 68.1,
  "pump_status": "ON",
  "water_flow": 1.2,
  "battery_level": 82,
  "battery_voltage": 11.9,
  "mode": "AUTO",
  "created_at": "2026-09-27T10:00:00Z"
}
```

**`GET /api/dashboard/devices/{device}/history?metric=soil_moisture&range=24h`** — `metric`: `soil_moisture` atau `battery_voltage`; `range`: `24h` / `7d` / `30d`.

**`GET /api/dashboard/devices/{device}/notifications`** — daftar `notif_log` device tersebut, terbaru dulu, pagination bawaan Laravel (`?page=1`).

**`POST /api/dashboard/devices/{device}/settings`** — partial update, divalidasi `UpdateSettingsRequest`:
```json
{
  "mode": "MANUAL",
  "pump_cmd": "ON",
  "moisture_lower": 35,
  "moisture_upper": 75
}
```

## 9. Halaman & Komponen UI (Frontend Next.js)

Frontend tidak lagi punya API Routes sendiri — semua data diambil lewat `apiClient.ts` yang memanggil `NEXT_PUBLIC_API_URL` (backend Laravel).

### 9.1 Halaman Daftar Device (`/`)
- `DeviceCard` per device: nama, status ringkas (pompa, baterai, kelembapan terakhir), indikator online/offline (berdasarkan `created_at` reading terakhir).
- Tombol "Tambah Device" → panggil `POST /api/dashboard/devices`, tampilkan API key sekali dengan opsi salin.
- Klik device → masuk ke Overview device tersebut (`/devices/[deviceId]`).

### 9.2 Halaman Overview per Device (`/devices/[deviceId]`)
- `DeviceSwitcher` di header untuk pindah antar device.
- `GaugeCard` — `soil_moisture` dan `battery_voltage` (Gauge chart).
- Angka real-time — `air_temp`, `air_humidity`, `water_flow`.
- `PumpStatusBadge` — `pump_status` (Indikator ikon).
- `BatteryIndicator` — `battery_level` (Progress bar).
- Auto-refresh berkala (polling `GET /api/dashboard/devices/{id}/latest`).

### 9.3 Halaman Settings per Device (`/devices/[deviceId]/settings`)
- `ModeToggle` — field `mode`.
- Tombol ON/OFF pompa — field `pump_cmd`; aktif hanya saat `mode = MANUAL`.
- `ThresholdForm` — `moisture_lower` & `moisture_upper`, validasi `lower < upper`, rentang 0–100.
- Info API key device ini (tersamar, opsi "buat ulang key").

### 9.4 Halaman History per Device (`/devices/[deviceId]/history`)
- `TrendChart` — tren `soil_moisture` dan `battery_voltage`, rentang 24 jam/7 hari/30 hari.

### 9.5 Halaman Notifications per Device (`/devices/[deviceId]/notifications`)
- `NotificationTable` — field `notif_log` device ini: tipe, pesan, waktu, urut terbaru.

Seluruh halaman wajib responsif dan **mobile-first** (proposal: "Berbasis Mobile Web").

## 10. Logika Bisnis Penting

- Setiap device sepenuhnya independen secara data; pengaturan satu device tidak boleh memengaruhi device lain.
- Identitas device pada endpoint ESP32 ditentukan murni dari `X-API-KEY` lewat middleware `AuthenticateDeviceApiKey` — tidak ada `device_id` dikirim manual oleh firmware.
- Perubahan `mode`/`pump_cmd` dari dashboard untuk satu device langsung memengaruhi respons `GET /api/device/command` pada polling berikutnya **hanya untuk device dengan API key bersangkutan**.
- Saat `mode = AUTO`, tombol kontrol manual pompa untuk device tersebut dinonaktifkan di dashboard.
- Cegah duplikasi `notif_log` untuk kejadian sejenis pada device yang sama dalam waktu singkat berturut-turut — logikanya dipusatkan di `NotificationRuleService`, bukan tersebar di controller.
- Saat device baru didaftarkan, buat baris `Setting` default (mode `AUTO`, ambang 40/70) untuk device itu secara otomatis.

## 11. Konvensi Coding

**Backend (Laravel):**
- Ikuti PSR-12 dan konvensi Laravel standar (Controller tipis, logika bisnis di Service class seperti `NotificationRuleService`).
- Validasi input lewat Form Request class (`StoreReadingRequest`, `UpdateSettingsRequest`), bukan validasi manual di controller.
- Bentuk JSON response lewat API Resource class (`ReadingResource`, `DeviceResource`) supaya konsisten dan field snake_case sesuai Tabel 5.1 terjaga.
- Semua query `Reading`/`Setting`/`NotifLog` wajib discope ke `device_id` yang relevan (lewat relasi `$device->readings()`, bukan query global).

**Frontend (Next.js):**
- TypeScript strict mode aktif.
- Komponen UI reusable (`GaugeCard`, `BatteryIndicator`, dll menerima props generik, termasuk `deviceId` bila relevan).
- Semua pemanggilan API lewat `lib/apiClient.ts`, bukan `fetch` tersebar di tiap komponen.
- Field API (request/response JSON) tetap snake_case sesuai Tabel 5.1; boleh dikonversi ke camelCase di lapisan internal TypeScript.

## 12. Testing & Mock Data

- `DeviceSeeder.php` membuat **minimal dua device** dummy, masing-masing dengan beberapa baris `readings` bernilai berbeda, supaya perilaku multi-device benar-benar teruji.
- Buat skrip simulasi (boleh `php artisan` custom command atau skrip terpisah) yang bisa menerima parameter API key, sehingga bisa dijalankan dua instance sekaligus untuk mensimulasikan dua ESP32 berbeda mengirim data bersamaan ke `POST /api/device/data`.
- Gunakan Laravel feature test (`php artisan test`) minimal untuk: autentikasi API key device, isolasi data antar device, dan validasi threshold di settings.

## 13. Urutan Pengerjaan yang Disarankan

1. Setup project Laravel (`backend/`) — konfigurasi `.env`, koneksi MySQL.
2. Buat migrasi sesuai Bagian 6 (termasuk tabel `devices`), jalankan `php artisan migrate`.
3. Buat model Eloquent beserta relasinya.
4. Implementasi middleware `AuthenticateDeviceApiKey` dan endpoint device (`/api/device/data`, `/api/device/command`).
5. Implementasi endpoint dashboard untuk manajemen device dan per-device (`latest`, `history`, `notifications`, `settings`), dengan Sanctum untuk autentikasi dashboard.
6. Buat `DeviceSeeder` (minimal 2 device) & skrip simulasi multi-device.
7. Setup project Next.js (`frontend/`), buat `apiClient.ts` yang mengarah ke backend Laravel.
8. Bangun komponen UI dasar sesuai pemetaan Tabel 5.1 (Bagian 9), termasuk `DeviceCard` dan `DeviceSwitcher`.
9. Rakit halaman Daftar Device, lalu Overview/Settings/History/Notifications per device.
10. Uji end-to-end dengan dua device simulasi berjalan bersamaan; pastikan data dan pengaturan satu device tidak bocor ke device lain.

## 14. Arahan Desain Visual (WAJIB — hindari desain pasaran/"AI slop")

Dashboard ini adalah antarmuka untuk memantau makhluk hidup (tanaman) dan sistem energi mandiri (surya) di beberapa lokasi sekaligus — desainnya harus terasa hidup dan spesifik untuk konteks itu, bukan template SaaS generik yang bisa dipakai untuk aplikasi apa saja.

### 14.1 Hindari pola-pola berikut (ciri paling umum desain buatan AI)

- Background krem hangat (`#F4F1EA`-ish) dengan aksen terracotta/oranye tanah (`#D97757`-ish) dan serif display kontras tinggi.
- Background hitam pekat dengan satu aksen neon acid-green atau vermilion.
- Semua konten dipotong jadi kartu seragam dengan satu radius sudut yang sama untuk segalanya, ditambah shadow abu-abu lembut yang sama di setiap kartu, dan gradient dekoratif tanpa fungsi.
- "Chrome" template: label eyebrow ALL-CAPS di atas setiap heading, teks meta yang disambung titik tengah ('A · B · C'), label bergaya 'KATA — fragmen' pakai em dash, hitam pudar (`#0B0B0B`/`#111`) menggantikan hitam asli, font monospace untuk label kecil, tanda panah '→' ditempel di akhir teks tombol/link.
- Setiap kartu dikasih animasi fade-slide-up saat load, dan setiap kartu dikasih efek hover yang sama persis — ini pola generik yang justru bikin desain terasa mati/template, bukan hidup.

### 14.2 Arah visual yang harus diambil

- Bangun palet warna dan tipografi dari **subject matter greenhouse & IoT** — pikirkan warna tanah, daun, air, sinyal elektronik, panel surya — bukan palet SaaS dashboard generik. Tentukan palet dasar (4–6 hex warna bernama) dan tipografi (1–2 typeface dengan peran jelas) di awal proses desain, sebelum menulis kode.
- Buat satu tata letak yang punya identitas jelas untuk halaman Daftar Device dan Overview, bukan grid kartu seragam yang bisa dipakai buat aplikasi lain manapun.
- Hierarki visual harus mencerminkan prioritas data sungguhan: kelembapan tanah dan status pompa adalah informasi paling kritis, jadi harus paling menonjol.
- Karena ada banyak device, `DeviceCard` di halaman daftar harus tetap mudah dibedakan satu sama lain secara visual, tanpa terasa seperti kartu produk e-commerce yang identik.

### 14.3 Animasi — harus terasa "hidup", bukan dekoratif

- **Update data live:** saat angka baru masuk, transisi angka lama ke baru dengan halus (count-up/count-down singkat), jangan langsung loncat/berkedip.
- **Gauge kelembapan tanah & tegangan baterai:** jarum/arc gauge bertransisi mulus ke nilai baru, bukan langsung snap.
- **Indikator pompa saat ON:** beri isyarat visual real-time (mis. animasi aliran/pulse halus pada ikon pompa), berhenti otomatis saat status kembali OFF.
- **Notifikasi baru:** muncul dengan transisi masuk yang jelas.
- **Status online/offline pada `DeviceCard`:** indikator halus (mis. titik status yang berdenyut pelan saat online).
- **Hindari** animasi seragam di semua elemen — fokuskan animasi pada elemen yang merepresentasikan data yang berubah (data-driven motion), bukan dekorasi kosmetik yang sama di mana-mana.
- Hormati preferensi `prefers-reduced-motion` pengguna.

### 14.4 Proses yang harus diikuti agent sebelum menulis kode UI

1. Buat rencana desain singkat dulu: palet warna (dengan nama & hex), pilihan tipografi & perannya, konsep layout untuk halaman Daftar Device dan Overview.
2. Tinjau ulang rencana itu — kalau ada bagian yang terasa seperti default generik (lihat 14.1), ganti dan jelaskan kenapa.
3. Baru setelah itu implementasi ke kode.

### 14.5 Rencana Desain yang Ditetapkan (sudah diimplementasikan)

Hasil dari proses 14.4 — ini yang sudah dipakai di `tailwind.config.ts` dan seluruh
komponen frontend. Perubahan pada palet/tipografi/layout di bawah ini wajib disinkronkan
ke sini juga, supaya dokumen ini tetap jadi acuan tunggal yang akurat.

**Palet warna** (diturunkan dari subjek greenhouse + elektronik IoT, bukan palet SaaS generik):

| Nama | Hex | Peran |
|---|---|---|
| Kabut Pagi | `#F7F9F7` | Background utama (putih sejuk, bukan krem/terracotta) |
| Hitam Tinta | `#1B211C` | Teks utama (hitam dengan undertone hijau, bukan `#111` generik) |
| Hijau Lumut | `#2F5233` | Primer — status sehat, tombol utama, kelembapan optimal |
| Biru Tangki | `#1C6E8C` | Aksen data air/sinyal — water flow, status pompa ON, chart |
| Kuning Surya | `#E8A93B` | Aksen energi — baterai, panel surya (dipakai hemat, bukan dominan) |
| Tanah Basah | `#6B5744` | Netral sekunder — border, teks pendukung, kelembapan rendah |
| Merah Karat | `#B23A2E` | Kritis — notifikasi selang tersumbat & baterai rendah |

**Tipografi** (3 peran berbeda dengan alasan tiap pilihan, bukan satu font generik untuk semua):

| Font | Variabel Tailwind | Peran |
|---|---|---|
| Fraunces | `font-display` | Nama device, judul halaman — serif organik, kesan "hidup/tumbuh" |
| Inter | `font-sans` (default) | UI, label, body text — legibilitas tinggi di layar kecil (mobile-first) |
| IBM Plex Mono | `font-mono` | Angka sensor & gauge — kesan "pembacaan instrumen elektronik" |

**Konsep layout:**

- **Daftar Device** (`/`): kartu "pot terrarium" disusun staggered (kolom tengah digeser
  turun via `sm:mt-8`), bukan grid seragam. Tiap `DeviceCard` punya indikator daun SVG
  yang terisi/layu sesuai `soil_moisture` — pengganti progress bar generik.
- **Overview per device** (`/devices/[deviceId]`): dibelah dua zona — **Tanaman**
  (`soil_moisture`, `air_temp`, `air_humidity`, `pump_status`, `water_flow`) di kiri,
  **Energi** (`battery_voltage`, `battery_level`, `mode`) di kanan, dipisah garis
  vertikal bergaya pipa (`bg-gradient-to-b`). Mencerminkan dua alur kerja terpisah di
  proposal (Gambar 4.1 vs Gambar 4.2), bukan dashboard kartu rata.

**Animasi data-driven** (lihat 14.3 untuk prinsip, ini implementasinya):

- `useCountUp` — transisi angka halus (ease-out-cubic, ~600ms) untuk semua nilai sensor;
  lompat langsung ke nilai akhir kalau `prefers-reduced-motion: reduce`.
- `GaugeCard` — `stroke-dashoffset` arc bertransisi, warna arc berubah sesuai nilai
  (tanah → hijau → biru untuk kelembapan; karat → surya → lumut untuk tegangan baterai).
- `PumpStatusBadge` — `strokeDasharray` + `animate-flow-dash` berjalan hanya saat
  `pump_status === "ON"`, berhenti total saat OFF (bukan animasi diam/statis).
- `DeviceCard` — dot online berdenyut pelan (`animate-pulse-dot`) hanya saat online.
- `NotificationTable` — entri baru masuk dengan `animate-slide-in-top`.
- Semua di atas dimatikan lewat media query global `prefers-reduced-motion: reduce` di
  `globals.css`, bukan dicek satu-satu di tiap komponen.

## 15. Catatan untuk AI Agent

- Backend dan frontend adalah **dua codebase terpisah** (Laravel di `backend/`, Next.js di `frontend/`) yang berkomunikasi lewat REST API — jangan campur logika backend ke dalam Next.js API Routes, dan jangan taruh file keduanya bercampur di satu folder yang sama. Ini sengaja dipisah tegas (Bagian 5) supaya pengguna bisa mengecek dan menjalankan masing-masing bagian secara independen.
- Kerjakan bertahap sesuai Bagian 13 — backend (migrasi, model, endpoint) selesai dan teruji dulu sebelum frontend mulai mengonsumsinya.
- Nama field database dan bentuk tampilan UI **harus mengikuti Tabel 5.1 di Bagian 6 secara persis**.
- Dukungan multi-device adalah kebutuhan inti sejak awal — struktur database dan API harus memisahkan data per device lewat `device_id` dari awal, bukan ditambahkan belakangan.
- Jika ada keputusan desain yang tidak dijelaskan eksplisit di dokumen ini, pilih opsi paling sederhana yang konsisten dengan konvensi Laravel/Next.js standar, dan sebutkan asumsi tersebut.
- Jangan menambah fitur di luar cakupan proposal tanpa menanyakannya terlebih dahulu.
- Desain visual dan animasi wajib mengikuti Bagian 14.
