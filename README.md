# Finpro - BOS Transparency Platform (BOS Monitor)

Proyek ini adalah website untuk memantau penggunaan Dana BOS. Pengguna bisa melihat ringkasan alokasi dana masing-masing sekolah, penggunaannya, dan memberikan ulasan atau umpan balik.

## Struktur Proyek

- `BOS-master/` : Frontend (React + Vite + Tailwind)
- `backend/` : Backend API (Express + PostgreSQL)

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts

**Backend**
- Node.js + Express
- PostgreSQL (`pg`)
- Auth: bcryptjs + JWT

## Cara Menjalankan di Lokal

### 1. Setup Backend

Masuk ke folder backend lalu install dependency:

```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend/`:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=rahasia_jwt_kamu
PORT=5000
```

Jalankan server:

```bash
node server.js
```

API akan berjalan di `http://localhost:5000/api`.
*Catatan: Skema database ada di file `backend/schema.sql`.*

### 2. Setup Frontend

Masuk ke folder frontend dan install dependency:

```bash
cd BOS-master
npm install
```

Buat file `.env` di dalam folder `BOS-master/`:

```env
VITE_API_URL=http://localhost:5000
```

Jalankan frontend:

```bash
npm run dev
```

Buka aplikasi melalui browser di `http://localhost:5173`.

## Daftar API

Base URL: `/api`

- `GET /api/schools` : Menampilkan daftar sekolah beserta info rating dan alokasi dana
- `GET /api/schools/:id` : Menampilkan detail sekolah
- `GET /api/funds/dashboard` : Menampilkan ringkasan total dan agregasi kategori dana
- `GET /api/reviews/:school_id` : Mengambil daftar ulasan untuk sekolah tertentu
- `POST /api/reviews` : Mengirim ulasan baru
- `POST /api/auth/register` : Mendaftarkan akun baru
- `POST /api/auth/login` : Login user

## Routing di Vercel

Frontend menggunakan `BrowserRouter`. Supaya halaman tidak error 404 ketika di-refresh (misalnya di `/review/new`), sudah disediakan konfigurasi di `BOS-master/vercel.json` dan `vercel.json` di root folder.

## Catatan Fitur Review

- Untuk memberikan ulasan, buka halaman `/review/new` (pilih sekolah, lalu isi rating dan komentar).
- Skor rating akhir yang tersimpan di database adalah nilai rata-rata dari 5 aspek penilaian.
- Kalau pengguna memilih opsi "anonymous", data `user_id` yang dikirim ke sistem menjadi `null`.
