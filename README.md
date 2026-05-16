# Finpro — BOS Transparency Platform (BOS Monitor)

Platform web untuk memantau transparansi penggunaan Dana BOS, melihat ringkasan alokasi/penggunaan dana per sekolah, serta membuat review/umpan balik.

## Struktur Proyek

- `BOS-master/` — Frontend (React + Vite + Tailwind)
- `backend/` — Backend API (Express + PostgreSQL/Vercel Postgres)

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router (BrowserRouter)
- Recharts

**Backend**
- Node.js + Express
- PostgreSQL (`pg`)
- Auth: bcryptjs (hash password) + JWT

## Menjalankan Secara Lokal

### 1) Backend

Masuk ke folder backend dan install dependency:

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=isi_dengan_secret_acak
PORT=5000
```

Jalankan server:

```bash
node server.js
```

API akan tersedia di:
- `http://localhost:5000/api`

Catatan:
- Skema tabel ada di `backend/schema.sql` (atau `backend/dump.sql`).

### 2) Frontend

Masuk ke folder frontend dan install dependency:

```bash
cd BOS-master
npm install
```

Buat file `.env` di folder `BOS-master/`:

```env
# Boleh base URL backend, nanti otomatis dinormalisasi menjadi .../api
VITE_API_URL=http://localhost:5000
```

Jalankan dev server:

```bash
npm run dev
```

Buka di browser:
- `http://localhost:5173`

## API Ringkas

Base: `/api`

- `GET /api/schools` — daftar sekolah + ringkasan rating/alokasi/persentase penggunaan
- `GET /api/schools/:id` — detail sekolah (kategori penggunaan, history, recent reviews)
- `GET /api/funds/dashboard` — ringkasan total + agregasi kategori
- `GET /api/reviews/:school_id` — daftar review per sekolah
- `POST /api/reviews` — buat review
- `POST /api/auth/register` — registrasi user
- `POST /api/auth/login` — login user

## Routing SPA (Vercel)

Frontend menggunakan `BrowserRouter`, jadi refresh pada route seperti:
- `/review/new`
- `/school/1`

memerlukan rewrite ke `index.html`.

Konfigurasi sudah disiapkan di `BOS-master/vercel.json`.

Jika project di Vercel masih di-deploy dari **root repo** (bukan Root Directory `BOS-master/`), gunakan konfigurasi root: `vercel.json` (di folder paling atas repo ini). Ini akan mencegah 404 ketika refresh route seperti `/review/new`.

## Deploy ke Vercel (Saran)

### Backend
- Set **Root Directory** ke `backend/`
- Pastikan env var di Vercel:
  - `DATABASE_URL`
  - `JWT_SECRET`

### Frontend
- Set **Root Directory** ke `BOS-master/`
- Set env var:
  - `VITE_API_URL` ke base URL backend (contoh: `https://your-backend.vercel.app`)

## Catatan Perilaku Review

- Halaman review: `/review/new` (pilih sekolah lalu isi rating & komentar)
- Skor yang dikirim ke backend adalah rata-rata dari 5 rating (dibulatkan).
- Jika memilih “anonymous”, `user_id` dikirim sebagai `null`.
