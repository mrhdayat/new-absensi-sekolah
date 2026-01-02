# 🎓 ATTENDLY - Sistem Manajemen Absensi & Gamifikasi Sekolah Cerdas

> **Platform Absensi Modern Terintegrasi dengan Sistem Gamifikasi untuk Meningkatkan Kedisiplinan Siswa**

![Status Proyek](https://img.shields.io/badge/Status-Active_Development-emerald?style=for-the-badge)
![Versi](https://img.shields.io/badge/Version-1.0.0_Beta-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_15_|_Prisma_|_Tailwind-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 📋 Daftar Isi

1.  [Tentang Proyek](#-tentang-proyek)
2.  [Arsitektur Sistem](#-arsitektur-sistem)
3.  [Fitur Mendalam & Cara Kerja](#-fitur-mendalam--cara-kerja)
    *   [Sistem Absensi & Penjadwalan](#-sistem-absensi--penjadwalan)
    *   [Gamifikasi Siswa (XP, Level, Badges)](#-gamifikasi-siswa)
    *   [Keamanan & Autentikasi](#-keamanan--autentikasi)
4.  [Teknologi & Dependensi](#-teknologi--dependensi)
5.  [Struktur Database (Schema Explainer)](#-struktur-database)
6.  [Dokumentasi API (Endpoints)](#-dokumentasi-api)
7.  [Panduan Instalasi Lengkap](#-panduan-instalasi-lengkap)
8.  [Panduan Penggunaan (User Manual)](#-panduan-penggunaan)
    *   [Untuk Admin](#untuk-admin)
    *   [Untuk Guru](#untuk-guru)
    *   [Untuk Wali Kelas](#untuk-wali-kelas)
    *   [Untuk Siswa](#untuk-siswa)
9.  [Troubleshooting & FAQ](#-troubleshooting--faq)
10. [Kontribusi & Roadmap](#-kontribusi--roadmap)

---

## 📖 Tentang Proyek

**Attendly** lahir dari kebutuhan sekolah modern untuk tidak hanya mendigitalkan administrasi yang membosankan, tetapi juga mengubah perilaku siswa menjadi lebih positif. Kebanyakan sistem absensi hanya bersifat mencatat data. Attendly berbeda; kami mengintegrasikan **Psikologi Gamifikasi** ke dalam rutinitas harian sekolah.

Setiap kali siswa hadir tepat waktu, mereka tidak hanya menghindari hukuman—mereka mendapatkan *Reward*. Ini mengubah mindset dari "Takut Terlambat" menjadi "Ingin Segera Sampai".

Sistem ini dibangun untuk menangani kompleksitas jadwal sekolah yang dinamis, perpindahan kelas, izin sakit yang terintegrasi, hingga pelaporan otomatis untuk Kepala Sekolah.

---

## 🏗 Arsitektur Sistem

Attendly dibangun di atas arsitektur **Monorepo Next.js** yang modern, memanfaatkan kemampuan Fullstack dari Next.js App Router (Server Actions & API Routes).

### Topologi
1.  **Frontend Layer (Client)**:
    *   Dibangun dengan React Server Components (RSC) untuk performa awal yang cepat.
    *   `use client` components digunakan selektif untuk interaktivitas (Form, Charts, Maps).
    *   State management menggunakan React Hooks sederhana dan URL State untuk filter.
2.  **Backend Layer (Server)**:
    *   **Next.js API Routes** (`/src/app/api/*`) bertindak sebagai REST API endpoints.
    *   Melakukan validasi input, otorisasi session, dan logika bisnis.
    *   Terhubung langsung ke database via Prisma ORM.
3.  **Database Layer**:
    *   PostgreSQL Relational Database.
    *   Dikelola melalui **Prisma Schema** yang menjamin integritas relasi antar tabel (User -> Student -> Attendance).
4.  **Security Layer**:
    *   **Middleware (`middleware.ts`)**: Penjaga gerbang utama. Memeriksa token session di setiap request halaman dan melakukan redirect jika role tidak sesuai.
    *   **NextAuth.js**: Menangani enkripsi session, hashing password (bcrypt), dan rotasi token.

---

## 🚀 Fitur Mendalam & Cara Kerja

### 📅 Sistem Absensi & Penjadwalan
Sistem ini menggunakan logika "Jadwal Dinamis". Tidak seperti absensi harian biasa, Attendly mencatat kehadiran **Per Mata Pelajaran**.

*   **Zero-Conflict Algorithm**: Saat Admin atau Script membuat jadwal, sistem memvalidasi 3 hal:
    1.  Apakah Ruangan dipakai kelas lain di jam itu?
    2.  Apakah Guru sedang mengajar di kelas lain di jam itu?
    3.  Apakah Kelas tersebut sudah ada pelajaran lain?
    *Jika terdeteksi bentrok, sistem menolak pembuatan jadwal.*
    
*   **Logika Penandaan Absen**:
    *   Guru membuka menu "Tandai Kehadiran".
    *   Sistem menarik data siswa yang *hanya* terdaftar di kelas tersebut.
    *   Sistem mengecek tabel `LeaveRequest` (Izin/Cuti). Jika siswa sedang Izin yang *Disetujui*, namanya akan ditandai otomatis dan Guru tidak bisa mengubahnya menjadi Alpha (karena valid).

### 🎮 Gamifikasi Siswa
Ini adalah "Jantung" dari motivasi siswa. Berikut detail mekanismenya:

#### 1. Experience Points (XP) Calculation
XP diberikan secara *real-time* saat guru menekan tombol "Simpan" pada absensi.

| Aksi | XP Didapat | Kondisi |
| :--- | :--- | :--- |
| **Hadir Tepat Waktu** | `+10 XP` | Status = PRESENT |
| **Terlambat** | `+5 XP` | Status = LATE |
| **Sakit / Izin** | `+2 XP` | Status = SICK/PERMITTED (Bonus kecil agar tidak demotivasi) |
| **Alpha / Bolos** | `0 XP` | Status = ABSENT |
| **Lencana (Badge)** | `+50 - +500 XP` | Tergantung tingkat kesulitan badge |

#### 2. Leveling System
Level dihitung berdasarkan akumulasi XP dengan kurva progresif. Rumus yang digunakan:
`Next Level XP = Base(100) + (CurrentLevel * 50)`

*   Level 1 -> 2 Butuh 150 XP.
*   Level 2 -> 3 Butuh 200 XP.
*   *Semakin tinggi level, semakin sulit naik.*

#### 3. Title (Gelar Kehormatan)
Siswa mendapatkan gelar yang tampil di Dashboard dan Leaderboard berdasarkan Level mereka:
*   **Lv 1-5**: *Pejuang Absen* (Gelar Pemula)
*   **Lv 6-10**: *Ksatria Rajin* (Menunjukkan konsistensi)
*   **Lv 11-20**: *Pahlawan Kelas* (Role model di kelas)
*   **Lv 21-50**: *Legenda Sekolah* (Sangat dihormati)
*   **Lv 50+**: *Dewa Kehadiran* (Pencapaian Tertinggi)

#### 4. Badges (Lencana Prestasi)
Lencana diberikan otomatis oleh `GamificationService` melalui pengecekan berkala atau trigger event.

*   🏆 **Early Bird**: Hadir sebelum jam 06:45 selama 5 hari berturut-turut.
*   🔥 **On Fire (Streak)**: Hadir tanpa putus selama 1 bulan penuh.
*   📚 **Scholar**: Nilai kehadiran 100% dalam satu semester.
*   🛡️ **Guardian**: Tidak pernah Alpha selama 1 tahun ajaran.

### 🔐 Keamanan & Autentikasi

#### 1. Role-Based Access Control (RBAC)
Setiap user memiliki role di database (`SUPER_ADMIN`, `ADMIN`, `PRINCIPAL`, `TEACHER`, `HOMEROOM_TEACHER`, `STUDENT`).
*   Middleware mencegah Siswa mengakses URL `/admin`.
*   API Route memvalidasi `session.user.role` sebelum mengeksekusi query database.

#### 2. Delegated Password Reset (Fitur Anturat)
Masalah umum di sekolah: Siswa lupa password.
Solusi Aman:
*   Siswa melapor ke Wali Kelas.
*   Wali Kelas menekan tombol "Reset Delegasi".
*   Sistem men-generate **OTP 6 Angka** (misal: `492-103`).
*   OTP ini hanya valid 15 menit.
*   Wali kelas memberikan OTP ke siswa.
*   Siswa login menggunakan OTP tersebut dan *dipaksa* mengganti password baru saat itu juga.
*   *Keamanan: Wali kelas tidak perlu tahu password lama siswa.*

#### 3. Audit Logging
Admin bisa melihat jejak digital: "Siapa melakukan apa, kapan?"
*   Contoh Log: `[TEACHER: Budi] CREATE Attendance for [CLASS: X-A] at [2024-05-20 08:00]`.

---

## 🛠 Teknologi & Dependensi

Berikut adalah rincian teknis mendalam mengenai pustaka yang digunakan:

### Core Framework
*   **next (15.1.0)**: Server Actions, App Router, SSR, API Routes.
*   **react (19.0.0)**: UI Library dengan dukungan Server Components.

### Database & Backend
*   **prisma (6.0.1)**: ORM Type-safe.
*   **@prisma/client**: Client query database.
*   **bcryptjs**: Hashing password satu arah (Salted).
*   **next-auth (5.0.0-beta)**: Authentication handler.

### UI & Styling
*   **tailwindcss**: Styling engine.
*   **clsx & tailwind-merge**: Utilitas untuk menggabungkan class CSS dinamis.
*   **lucide-react**: Set ikon SVG yang ringan dan konsisten.
*   **framer-motion**: Animasi layout dan micro-interactions.
*   **cmdk**: Komponen Command Palette (Ctrl+K).
*   **date-fns**: Manipulasi dan format tanggal (e.g., "Senin, 20 Mei 2024").

---

## 🗄 Struktur Database

Schema database dirancang dengan normalisasi tingkat tinggi. Berikut tabel-tabel utamanya:

### 1. User & Auth
*   **User**: Tabel induk. Menyimpan email, password (hashed), role, dan info umum.
*   **Student**: Detail profil siswa (NIS, NISN, Relasi ke Kelas).
*   **Teacher**: Detail profil guru (NIP, Mapel Spesialisasi).

### 2. Akademik
*   **AcademicYear**: Tahun ajaran (2024/2025 Ganjil). Hanya satu yang statusnya `ACTIVE`.
*   **Class**: Entitas Kelas (X-IPA-1). Memiliki relasi `homeroomTeacher` (Wali Kelas).
*   **Subject**: Mata Pelajaran (Matematika, Biologi).
*   **Schedule**: Jadwal spesifik (Senin, 07:00-08:30, Kelas X-A, Mapel MTK, Guru Budi).

### 3. Transaksi Absensi
*   **StudentAttendance**: Record kehadiran. Kunci unik (Composite Key): `[studentId, scheduleId, date]`.
    *   Mencegah duplikasi data absen untuk jadwal yang sama di hari yang sama.
*   **LeaveRequest**: Permohonan cuti. Memiliki status `PENDING`, `APPROVED`, `REJECTED`.

### 4. Gamifikasi
*   **GamificationProfile**: Relasi 1-to-1 dengan User. Menyimpan `xp`, `level`, `streakDays`.
*   **Badge**: Master data lencana.
*   **UserBadge**: Tabel pivot many-to-many (User punya banyak Badge).

---

## 📡 Dokumentasi API

Berikut adalah beberapa endpoint kunci yang tersedia di `src/app/api`:

### Authentication
*   `POST /api/auth/login` -> Melakukan verifikasi kredensial.
*   `GET /api/auth/session` -> Mengambil sesi user saat ini.

### Users (Admin Only)
*   `GET /api/users` -> List semua user dengan filter role.
*   `POST /api/users` -> Membuat user baru + profil terkait (Student/Teacher).
*   `PATCH /api/users/[id]` -> Edit profil (misal ganti kelas siswa).

### Attendance (Transactional)
*   `POST /api/attendance/student`
    *   **Body**: `{ scheduleId: string, date: string, attendances: Array<{ studentId, status }> }`
    *   **Logic**: Melakukan `upsert` (Insert atau Update). Memicu `GamificationService` jika status Hadir.
*   `GET /api/homeroom/attendance/student/[id]`
    *   **Response**: Detail history absensi, statistik persentase kehadiran.

### Gamification
*   `GET /api/gamification/leaderboard` -> Top 10 siswa berdasarkan Level.
*   `GET /api/gamification/me` -> Profil gamifikasi user yang sedang login.

---

## 💻 Panduan Instalasi Lengkap

### Persiapan Lingkungan
1.  Pastikan **Node.js** terinstall: `node -v` (Harus v18+).
2.  Pastikan **PostgreSQL** berjalan. Bisa gunakan Docker jika tidak ingin install native.

### Langkah 1: Cloning
```bash
git clone https://github.com/mrhdayat/elearning-app-web.git
cd elearning-app-web
```

### Langkah 2: Instalasi Paket
```bash
npm ci
# Menggunakan 'ci' (Clean Install) lebih disarankan untuk konsistensi version lock
```

### Langkah 3: Setup Database
Copy file env:
```bash
cp .env.example .env
```
Edit `.env` dan sesuaikan `DATABASE_URL`.
Contoh untuk lokal:
`DATABASE_URL="postgresql://postgres:password123@localhost:5432/attendly_db?schema=public"`

Jalankan migrasi database:
```bash
npx prisma migrate dev --name init
```
*Ini akan membuat tabel-tabel kosong di database Anda.*

### Langkah 4: Seeding (PENTING)
Agar aplikasi tidak kosong melompong, jalankan seeder. Script ini sangat canggih, akan men-generate:
*   1 Tahun Ajaran Aktif.
*   3 Tingkat Kelas (X, XI, XII).
*   20+ Mata Pelajaran.
*   10+ Guru dengan nama realistis.
*   30+ Siswa per kelas dengan nama acak tapi realistis (menggunakan Faker).
*   **Ratusan Jadwal Pelajaran** yang terjamin tidak bentrok.
*   Data Absensi dummy untuk 30 hari terakhir.

Eksekusi:
```bash
npm run seed
```
*Tunggu beberapa saat hingga muncul pesan "Seeding completed successfully".*

### Langkah 5: Menjalankan Server
```bash
npm run dev
```
Aplikasi berjalan di `http://localhost:3000`.

---

## 📖 Panduan Penggunaan

### Untuk Admin
1.  Login via `superadmin@attendly.id` (Pass: `admin123`).
2.  Menu **Master Data**: Gunakan untuk menambah Mapel baru atau Guru baru.
3.  Menu **Manajemen User**: Jika ada siswa pindahan, buat akunnya di sini.
4.  Menu **Audit Logs**: Cek secara berkala untuk melihat aktivitas mencurigakan.

### Untuk Guru
1.  Login dengan akun Guru (Pass Default: `123456`).
2.  Di Dashboard, lihat bagian **"Jadwal Mengajar Hari Ini"**.
3.  Klik jadwal yang sedang berlangsung.
4.  Anda akan diarahkan ke halaman **"Tandai Kehadiran"**.
5.  Absen siswa satu per satu atau gunakan tombol "Semua Hadir" untuk cepat.
6.  Klik **Simpan**. 
7.  *Notifikasi*: Anda akan melihat konfirmasi dan siswa akan menerima XP.

### Untuk Wali Kelas
1.  Login dengan akun Wali Kelas.
2.  Menu **"Kelas Saya"**: Menampilkan statistik kelas binaan Anda.
3.  Jika ada **Siswa Bermasalah** (Kehadiran < 80%), mereka akan muncul di widget "Perhatian Khusus".
4.  Menu **"Approval Izin"**: Setujui atau Tolak surat izin yang dikirim siswa.

### Untuk Siswa
1.  Login dengan akun Siswa.
2.  **Dashboard**: Lihat Level dan Rank Anda.
3.  **Leaderboard**: Cek posisi Anda dibanding teman sekelas.
4.  Menu **"Ajukan Izin"**: Jika sakit, upload foto surat dokter di sini. Wali kelas akan menerima notifikasi.

---

## ❓ Troubleshooting & FAQ

**Q: Mengapa saya tidak bisa login dengan akun yang baru dibuat?**
A: Pastikan role sudah benar. Cek juga apakah password sudah sesuai. Default password untuk user yang dibuat via Admin adalah `123456`.

**Q: Jadwal tidak muncul di dashboard Guru?**
A: Pastikan "Tahun Ajaran Aktif" sudah diset dengan benar oleh Admin. Jadwal yang dibuat di tahun ajaran non-aktif tidak akan muncul.

**Q: Bagaimana cara menghapus data tes (Reset DB)?**
A: Hati-hati! Gunakan perintah `npx prisma migrate reset`. Ini akan menghapus SEMUA data dan menjalankan seed ulang.

**Q: Build gagal di Vercel?**
A: Biasanya karena cache atau Post Install script. Coba tambahkan script `"postinstall": "prisma generate"` di `package.json`.

---

## 🤝 Kontribusi & Roadmap

Kami sangat terbuka untuk kontribusi!
Fitur yang direncanakan untuk versi selanjutnya (v2.0):
*   [ ] **Integrasi WhatsApp Gateway**: Notifikasi otomatis ke orang tua saat siswa bolos.
*   [ ] **Face Recognition**: Absensi mandiri siswa via Kiosk di gerbang sekolah.
*   [ ] **Jurnal Guru**: Mencatat materi apa yang diajarkan hari ini.
*   [ ] **Rapor Karakter**: Menilai sikap siswa selain kehadiran (Kedisiplinan, Kerapian).

Silakan Fork repository ini dan buat Pull Request!

---

**ATTENDLY** © 2024 - Membangun Generasi Disiplin Melalui Teknologi.
Dibuat dengan ❤️ dan ☕.
