# 🌿 HydroMind — Intelligent Water Management System

Dashboard pemantauan & otomasi penyiraman cerdas untuk greenhouse mini berbasis IoT tenaga surya (ESP32).

---

## 🏗 Arsitektur Sistem

- **Backend:** Laravel 11 (PHP 8.2+) REST API, Eloquent ORM, MySQL/SQLite, Sanctum & Device API-Key Middleware
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts

---

## 🚀 Cara Menjalankan Project

### 1. Menjalankan Backend (Laravel)

Buka terminal di folder `backend`:

```bash
cd backend

# Setup environment & database
php artisan key:generate
php artisan migrate:fresh --seed

# Jalankan server Laravel API
php artisan serve
```

Server API akan aktif di `http://127.0.0.1:8000`.

### 2. Menjalankan Frontend (Next.js)

Buka terminal di folder `frontend`:

```bash
cd frontend

# Jalankan server frontend
npm run dev
```

Dashboard web akan aktif di `http://localhost:3000`.

---

## 📡 Simulasi Hardware ESP32

Anda dapat menjalankan skrip simulasi ESP32 untuk mengirimkan data sensor real-time ke backend:

```bash
cd backend
php artisan simulate:device
```

Perintah ini akan secara periodik mengirimkan:
- Kelembapan tanah (`soil_moisture`)
- Suhu & kelembapan udara (`air_temp`, `air_humidity`)
- Status & debit pompa (`pump_status`, `water_flow`)
- Level & tegangan baterai tenaga surya (`battery_level`, `battery_voltage`)

Dan mengambil perintah (`mode`, `pump_cmd`, ambang batas kelembapan) dari server.

---

## 🧪 Menjalankan Testing

Untuk memverifikasi fungsionalitas backend dan endpoint API:

```bash
cd backend
php artisan test
```
