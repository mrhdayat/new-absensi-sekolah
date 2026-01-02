# ATTENDLY: Sistem Informasi Absensi & Manajemen Sekolah Modern

**Versi Dokumen:** 2.0.0
**Terakhir Diperbarui:** 2026-01-02
**Status Proyek:** Aktif / Production Ready

---

## 📋 Daftar Isi

1. [Sneak Peek & Visualisasi Sistem](#1-sneak-peek--visualisasi-sistem)
2. [Tentang Sistem ini](#3-tujuan-pembuatan-sistem)
3. [Ruang Lingkup & Cakupan](#4-ruang-lingkup-aplikasi)
4. [Manajemen Role & Akses](#5-definisi-role--hak-akses)
5. [Arsitektur Teknis](#6-arsitektur-sistem)
6. [Teknologi & Stack](#8-teknologi-yang-digunakan)
7. [Struktur Kode Sumber](#9-struktur-folder-project)
8. [Desain Database (ERD)](#10-database-design)
9. [Keamanan & Autentikasi](#11-sistem-autentikasi--otorisasi)
10. [Fitur Unggulan](#16-manajemen-kelas--mata-pelajaran)
11. [Manajemen Akademik](#17-sistem-jadwal-mengajar)
12. [Sistem Absensi](#19-sistem-absensi-guru)
13. [UI/UX & Frontend](#23-uiux-principles)
14. [Operasional & DevOps](#33-deployment-strategy)
15. [FAQ & Roadmap](#36-faq-teknis)

---

## 1. Sneak Peek & Visualisasi Sistem

### 1.1 Dashboard Overview (Konsep)
Sistem ini menggunakan antarmuka **Dashboard Modern** dengan layout responsif yang beradaptasi secara mulus antara desktop, tablet, dan mobile.

```mermaid
graph TD
    User[Pengguna] -->|Login| Auth[Autentikasi Layer]
    Auth -->|Token Valid| Router[Role Based Router]
    Router -->|Role: Admin| AdminDb[Admin Dashboard]
    Router -->|Role: Guru| TeacherDb[Teacher Dashboard]
    Router -->|Role: Siswa| StudentDb[Student Dashboard]
    
    AdminDb --> Mgmt[Manajemen Data]
    TeacherDb --> Abs[Input Absensi]
    StudentDb --> View[Lihat Laporan]
```

### 1.2 Wireframe Konseptual
- **Login Screen**: Minimalis, fokus pada input kredensial dengan ilusi keamanan (animasi mata pada password).
- **Sidebar Navigation**: Menu collapsible untuk memaksimalkan ruang kerja pada layar kecil.
- **Data Tables**: Tabel interaktif dengan filter, sorting, dan bulk actions.

---

## 2. Fitur Masa Depan (Future Roadmap)

Pengembangan sistem tidak berhenti pada peluncuran. Fitur berikut direncanakan untuk fase berikutnya:
- **AI-Powered Analytics**: Prediksi siswa yang berisiko tinggal kelas berdasarkan pola absensi.
- **Biometric Integration**: Absensi wajah (Face Recognition) untuk validasi kehadiran di sekolah.
- **WhastApp Gateway Integration**: Notifikasi real-time ke orang tua siswa via WA.
- **Payment Gateway**: Integrasi pembayaran SPP langsung di dalam aplikasi.

---

## 3. Tujuan Pembuatan Sistem

Sistem **Attendly** dibangun untuk menjawab tantangan modernisasi administrasi sekolah:
1.  **Eliminasi Paperwork**: Mengganti absensi kertas manual yang rentan hilang dan sulit direkap.
2.  **Transparansi Real-time**: Memungkinkan Kepala Sekolah memantau kehadiran guru dan siswa detik ini juga.
3.  **Integritas Data**: Mencegah manipulasi data kehadiran melalui validasi sistem yang ketat.
4.  **Efisiensi Wali Kelas**: Mengurangi beban administratif wali kelas dalam merekap laporan bulanan.
5.  **Keamanan Akun Siswa**: Menyediakan mekanisme pemulihan akun yang aman bagi siswa yang sering lupa password tanpa membebani admin pusat.

---

## 4. Ruang Lingkup Aplikasi

### Inti Aplikasi
Aplikasi ini mencakup seluruh siklus manajemen kehadiran akademik, mulai dari konfigurasi tahun ajaran, penjadwalan, pencatatan harian, hingga pelaporan akhir semester.

### Cakupan Fungsional
- **Master Data**: Pengelolaan data Guru, Siswa, Kelas, Mata Pelajaran, dan Jadwal.
- **Transaksi Harian**: Absensi harian (Guru ke Siswa), Absensi mandiri (Guru), Pengajuan Izin/Sakit.
- **Laporan**: Rekapitulasi kehadiran harian, mingguan, bulanan, dan per semester.
- **Utilitas**: Reset password, notifikasi sistem, audit log aktivitas.

---

## 5. Definisi Role & Hak Akses

Sistem menggunakan **RBAC (Role-Based Access Control)** yang ketat.

| Role | Kode | Deskripsi & Wewenang |
| :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | Memiliki akses mutlak (root). Bisa mengelola admin lain, melihat audit log sensitif, dan konfigurasi sistem level rendah. |
| **Admin** | `ADMIN` | Pengelola operasional harian. Mengelola data master (Siswa, Guru, Jadwal), mengatur Tahun Ajaran. Tidak bisa melihat log sensitif Super Admin. |
| **Kepala Sekolah** | `PRINCIPAL` | *View-only* (Analitik). Mengakses dashboard monitoring, melihat kinerja guru, dan statistik kehadiran siswa. |
| **Guru** | `TEACHER` | Melakukan absensi mandiri, melihat jadwal mengajar, mengajukan izin. |
| **Wali Kelas** | `HOMEROOM` | *Extended Teacher*. Memiliki wewenang atas kelas binaannya (validasi izin siswa, rekap laporan kelas, reset password siswa). |
| **Siswa** | `STUDENT` | Melihat riwayat kehadiran sendiri, melihat jadwal, melakukan check-in (jika diaktifkan), mengubah profil terbatas. |

---

## 6. Arsitektur Sistem

Kami menerapkan arsitektur **Monolith Modular** berbasis Next.js App Router.

### Frontend Layer (Client-Side)
- **Framework**: React 19 (via Next.js 15).
- **State Management**: React Hooks & Context API (untuk Auth).
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives).
- **Fetching**: Server Actions & Native Fetch API.

### Backend Layer (Server-Side)
- **API Runtime**: Next.js Route Handlers (Edge/Nodejs Runtime).
- **ORM**: Prisma ORM untuk type-safety database queries.
- **Validation**: Zod (Schema Validation).
- **Auth**: NextAuth.js v5 (Beta) dengan Session Strategy (JWT).

### Database Layer
- **Relational DB**: PostgreSQL (Support Complex Joins & Transactions).
- **Connection Pooling**: Dikelola oleh Prisma Client.

---

### 7. Diagram Arsitektur (Mermaid)

```mermaid
graph TD
    subgraph Client ["Client Device (Browser)"]
        Dashboard[Dashboard]
        Forms[Input Forms]
        Notify[Notifications]
    end

    subgraph AppServer ["Application Server (Next.js)"]
        Middleware{Middleware<br/>Auth & RBAC}
        API[API Route Handlers<br/>Controllers]
        NextAuth[NextAuth.js<br/>Session Mgmt]
        Prisma[Prisma ORM<br/>Query Engine]
    end

    subgraph Database ["Database Layer"]
        Postgres[(PostgreSQL)]
    end

    Dashboard -->|HTTPS/WSS| Middleware
    Middleware -->|Validated| API
    API -->|Auth Check| NextAuth
    API -->|Query| Prisma
    Prisma -->|TCP Connect| Postgres
```

---

## 8. Teknologi yang Digunakan

| Kategori | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15** | Server-side rendering untuk performa awal, App Router untuk routing modern yang intuitif. |
| **Bahasa** | **TypeScript** | Type-safety wajib untuk sistem skala institusi guna meminimalisir runtime error. |
| **Database** | **PostgreSQL** | Standar industri untuk integritas data relasional kompleks dan concurrency tinggi. |
| **ORM** | **Prisma** | Developer experience terbaik, migrasi skema yang aman, dan autocomplete query yang akurat. |
| **Styling** | **Tailwind CSS** | Pengembangan UI cepat dengan konsistensi design system. |
| **Component Lib** | **Shadcn/UI** | Komponen aksesibel, mudah dikustomisasi, dan copy-paste friendly. |
| **Auth** | **NextAuth.js v5** | Solusi autentikasi lengkap dengan dukungan OAuth dan Credentials yang fleksibel. |
| **Icons** | **Lucide React** | Set ikon yang konsisten, ringan, dan modern. |

---

## 9. Struktur Folder Project

Struktur folder mengikuti konvensi **Next.js App Router** dengan pemisahan concern yang jelas.

```bash
/src
├── /app                    # App Router Root
│   ├── /(auth)             # Route Group: Halaman Autentikasi (Login, Forgot Pass)
│   ├── /(dashboard)        # Route Group: Halaman Terproteksi (Layout Dashboard)
│   │   ├── /admin          # Halaman khusus role Admin
│   │   ├── /teacher        # Halaman khusus Guru
│   │   └── /student        # Halaman khusus Siswa
│   ├── /api                # Backend API Routes
│   │   ├── /students       # REST Endpoints untuk Siswa
│   │   ├── /attendance     # REST Endpoints untuk Absensi
│   │   └── /auth           # NextAuth Endpoints
│   └── globals.css         # Global Styles
├── /components             # Reusable React Components
│   ├── /ui                 # Atomic Components (Button, Input, Card)
│   ├── /layout             # Sidebar, Header, Footer
│   └── /feature            # Komponen spesifik fitur (AttendanceTable, etc.)
├── /lib                    # Utilitas & Konfigurasi
│   ├── prisma.ts           # Prisma Client Instance
│   ├── auth.ts             # Konfigurasi NextAuth
│   └── utils.ts            # Helper functions
├── /scripts                # Script Utilitas (Db Seed, Debug, Audit)
└── /types                  # Definisi Type Global
```

---

## 10. Database Design

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--|| Student : "has profile"
    User ||--|| Teacher : "has profile"
    SchoolClass ||--o{ Student : "contains"
    Teacher ||--o{ SchoolClass : "manages (homeroom)"
    AcademicYear ||--o{ Schedule : "defines"
    SchoolClass ||--o{ Schedule : "has"
    Teacher ||--o{ Schedule : "teaches"
    Subject ||--o{ Schedule : "subject of"
    Schedule ||--o{ Attendance : "records"
    Student ||--o{ Attendance : "attends"

    User {
        string id PK
        string email
        string password
        enum role "ADMIN..."
    }

    Student {
        string nis UK
        string nisn
    }

    SchoolClass {
        string name
        string grade
    }

    Attendance {
        enum status "PRESENT..."
        timestamp date
    }
    
    LandingPageSettings {
        string heroTitle
        string primaryColor
    }
    
    LandingFeature {
        string title
        string icon
    }
```

---

## 11. Sistem Autentikasi & Otorisasi

### Auth Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextAuth
    participant DB

    User->>Frontend: Input Email & Password
    Frontend->>NextAuth: POST /api/auth/callback/credentials
    NextAuth->>DB: Find User by Email
    DB-->>NextAuth: User Record Hash
    NextAuth->>NextAuth: Compare Password (Bcrypt)
    
    alt Password Valid
        NextAuth-->>Frontend: Session Token (JWT)
        Frontend->>User: Redirect to Dashboard
    else Password Invalid
        NextAuth-->>Frontend: Error "Invalid Credentials"
        Frontend->>User: Show Error Message
    end
```

### Middleware Security
File `middleware.ts` bertindak sebagai firewall aplikasi:
- Mencegah akses ke `/admin/*` jika role bukan `ADMIN` atau `SUPER_ADMIN`.
- Mencegah akses ke halaman login jika sudah login (redirect ke dashboard).
- Mengamankan API routes dari akses publik tanpa token.

---

## 12. Sistem OTP & Email Verification

Verifikasi email sangat krusial untuk keamanan akun guru dan admin.

1.  **Trigger**: User meminta ubah email atau reset password.
2.  **Generate**: Sistem membuat kode 6-digit acak kriptografis.
3.  **Store**: Kode disimpan di Redis atau Database sementara dengan TTL (Time To Live) 5-10 menit.
4.  **Send**: Dikirim via SMTP (Nodemailer) ke email tujuan.
5.  **Verify**: User input kode. Sistem mencocokkan. Jika valid dan belum expired, aksi diizinkan.

---

## 13. Hybrid Password Reset (Khusus Siswa)

Siswa sering tidak memiliki email aktif atau lupa password email mereka. Solusi kami: **Delegated Reset**.

- **Siswa**: Tidak bisa reset sendiri via email jika tidak punya email. Lapor ke Wali Kelas.
- **Wali Kelas**: Memiliki menu "Kelola Siswa" -> "Reset Password".
    - Wali kelas memverifikasi identitas siswa secara fisik.
    - Klik "Reset Password" -> Sistem mengembalikan password ke default (misal: Tanggal Lahir `DDMMYYYY`).
- **Super Admin**: Juga bisa melakukan ini sebagai fallback level terakhir.

---

## 14. Flow Lupa Password per Role

- **Admin/Guru**:
    1. Klik "Lupa Password" di login.
    2. Input Email.
    3. Terima Link/OTP di email.
    4. Buat password baru.
- **Siswa**:
    1. Lapor Wali Kelas.
    2. Wali Kelas reset via dashboard.
    3. Siswa login dengan password default.
    4. Sistem memaksa siswa ganti password saat login pertama (Force Change Password - *Future Feature*).

---

## 15. Flow Update Email & Verifikasi

Mengubah email adalah tindakan sensitif (Account Takeover Risk).

1.  User request ganti email di Profile.
2.  Sistem mengirim OTP ke **Email LAMA** (untuk memastikan yang request adalah pemilik asli).
3.  Setelah OTP Email Lama valid -> User input Email Baru.
4.  Sistem mengirim OTP ke **Email BARU** (untuk memastikan email baru valid/aktif).
5.  Setelah OTP Email Baru valid -> Database diupdate.

---

## 16. Manajemen Kelas & Mata Pelajaran

Modul ini adalah tulang punggung sistem akademik.

- **Kelas**: Grup siswa. Satu kelas wajib punya satu Wali Kelas. Relasi `Class` -> `Teacher` (Homeroom).
- **Mata Pelajaran**: Katalog pelajaran.
- **Kenaikan Kelas**: Fitur (Batch Operation) untuk memindahkan siswa dari X ke XI secara massal di akhir tahun ajaran (*Planned*).

---

## 17. Sistem Jadwal Mengajar

Penjadwalan komplek diatasi dengan skema relasional:

- Entitas: `Jadwal`
- Atribut: `Hari`, `Jam Mulai`, `Jam Selesai`, `KelasID`, `MapelID`, `GuruID`, `TahunAjaranID`.

Sistem UI menyediakan tampilan Kalender atau Grid mingguan agar mudah dibaca.

---

## 18. Algoritma Anti Bentrok Jadwal

Saat Admin membuat jadwal baru, sistem menjalankan pengecekan **Collision Detection** di backend:

**Pseudocode Logika:**
```typescript
function checkConflict(newSchedule) {
  // Cari jadwal lain DENGAN GURU YANG SAMA
  const conflictTeacher = db.schedule.find({
    teacherId: newSchedule.teacherId,
    day: newSchedule.day,
    startTime: { lt: newSchedule.endTime },
    endTime: { gt: newSchedule.startTime }
  });

  // Cari jadwal lain DI KELAS YANG SAMA
  const conflictClass = db.schedule.find({
    classId: newSchedule.classId,
    day: newSchedule.day,
    startTime: { lt: newSchedule.endTime },
    endTime: { gt: newSchedule.startTime }
  });

  if (conflictTeacher) throw Error("Guru sedang mengajar di kelas lain!");
  if (conflictClass) throw Error("Kelas sedang dipakai pelajaran lain!");
}
```

---

## 19. Sistem Absensi Guru

Guru melakukan absensi diri sendiri (Check-in/Check-out).

- **Flow**: Guru login -> Klik "Absensi Masuk" di Dashboard.
- **Validasi**:
    - Apakah hari ini hari kerja?
    - Apakah jam sekarang dalam rentang jam masuk?
    - (Future) Validasi Geolocation (Radius 100m dari sekolah).

---

## 20. Sistem Absensi Siswa

Absensi siswa dilakukan oleh Guru Pengajar saat jam pelajaran berlangsung (Jurnal Kelas).

- **Flow**:
    1. Guru buka menu "Jadwal Saya".
    2. Pilih jam pelajaran yang sedang aktif.
    3. Muncul daftar siswa di kelas tersebut.
    4. Guru menandai status: Hadir (Default), Sakit, Izin, Alpha.
    5. Submit -> Data tersimpan.

---

## 21. Validasi Waktu & Lokasi Absensi

Untuk mencegah kecurangan (Input Absensi dari rumah):
1.  **Time Window**: Absensi hanya bisa diinput pada jam pelajaran tersebut berlangsung (+/- toleransi 15 menit).
2.  **IP Restriction** (Opsional): Hanya bisa akses dari IP WiFi sekolah.
3.  **Geolocation**: Menggunakan Browser Geolocation API untuk mengirim lat/long saat submit. Server memvalidasi jarak `Hardersine Distance` ke koordinat sekolah.

---

## 22. Dashboard per Role

Setiap role disambut dengan dashboard yang relevan (Contextual Dashboard).

- **Admin**: Grafik kehadiran total sekolah, daftar guru yang terlambat hari ini, status server.
- **Guru**: Jadwal mengajar hari ini, notifikasi izin siswa hari ini.
- **Siswa**: Presentase kehadiran diri sendiri, grafik performa kehadiran.

---

## 23. UI/UX Principles (Modern & Minimalist)

Desain mengikuti prinsip **Clean Aesthetics**.
- **Whitespace**: Penggunaan ruang putih yang dominan agar mata tidak lelah.
- **Hierarki Tipografi**: Perbedaan jelas antara Heading, Subheading, dan Body text.
- **Feedback Loop**: Setiap aksi (Simpan, Hapus, Edit) selalu diikuti dengan Toast Notification (Sukses/Gagal).
- **Loading States**: Skeleton loading saat data sedang diambil (tidak ada layar putih kosong).

---

## 24. Sistem Notifikasi

Bukan sekadar `alert('Hello')`.
Sistem notifikasi terpusat menggunakan komponen `Toast` atau `Snackbar`.
- **Tipe**: Success (Hijau), Error (Merah), Warning (Kuning), Info (Biru).
- **Posisi**: Pojok kanan bawah atau atas, tidak mengganggu konten utama.
- **Auto Dismiss**: Hilang otomatis setelah 3-5 detik.

---

## 25. Audit Log & Logging Sistem

Setiap aksi krusial dicatat dalam tabel `AuditLog`.
- Siapa? (`userId`, `role`)
- Melakukan Apa? (`action`: CREATE_STUDENT, DELETE_CLASS)
- Kapan? (`timestamp`)
- Data Apa? (`targetId`, `details`)

Ini vital untuk audit IT. Jika data siswa hilang, kita bisa melacak siapa pelakunya.

---

## 26. Error Handling Strategy

1.  **Frontend**: Error Boundary React untuk menangkap crash UI.
2.  **API**: `try-catch` blok di setiap route handler.
3.  **Global Error**: Mengembalikan respons JSON standar `{ error: "Pesan", code: 500 }`.
4.  **Logging**: Error server dicatat di `console` (atau log service eksternal seperti Sentry di production).

---

## 27. Security Best Practices

1.  **Sanitization**: Semua input user dibersihkan untuk mencegah XSS.
2.  **Prepared Statements**: Prisma otomatis menangani ini untuk mencegah SQL Injection.
3.  **CSRF Protection**: NextAuth menangani CSRF token secara otomatis.
4.  **Secure Headers**: Implementasi Helmet headers (HSTS, No-Sniff).
5.  **Least Privilege**: Role Guru tidak punya akses ke menu Admin sedikitpun (di- enforce di BE dan FE).

---

## 28. Performance Optimization

- **React Server Components (RSC)**: Mengurangi JS bundle yang dikirim ke klien.
- **Image Optimization**: `next/image` untuk lazy loading dan resizing otomatis.
- **Debouncing**: Input pencarian menunggu 300ms sebelum request API.
- **Caching**: Memanfaatkan `unstable_cache` Next.js untuk data yang jarang berubah (seperti daftar Provinsi/Kota).

---

## 29. API Documentation

Contoh Endpoint `src/app/api/students`:

`GET /api/students`
- Query Params: `?page=1&limit=10&search=John`
- Response:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "total": 100, "page": 1 }
}
```

`POST /api/students`
- Body: `{ "nis": "123", "name": "Budi", ... }`
- Response: `201 Created`

---

## 30. State Machine & Flow Diagram (Absensi)

```mermaid
stateDiagram-v2
    [*] --> Pending: Siswa Ajukan Izin
    Pending --> Approved: Wali Kelas Setuju
    Pending --> Rejected: Wali Kelas Tolak
    Approved --> [*]: Selesai
    Rejected --> [*]: Selesai
    
    note right of Pending
        Siswa menunggu persetujuan
        Notifikasi ke Wali Kelas
    end note
```

Status Izin Siswa memiliki flow:
`PENDING` (Diajukan Siswa) --> `APPROVED` (Disetujui Wali Kelas) --> `REJECTED` (Ditolak).
Hanya status `PENDING` yang bisa diubah. Jika sudah `APPROVED`, harus di-reset oleh Admin jika ada kesalahan.

---

## 31. Mobile-First Strategy

CSS ditulis dengan pendekatan Mobile-First.
- Default style adalah untuk layar kecil.
- `@media (min-width: md)` untuk penyesuaian tablet/desktop.
- Sidebar berubah menjadi "Drawer" (Hamburger Menu) di layar mobile.
- Ukuran tombol dioptimalkan untuk sentuhan jari (min 44px height).

---

## 32. Testing Strategy

1.  **Unit Testing**: Menguji fungsi utilitas tanggal, kalkulator nilai.
2.  **Integration Testing**: Menguji API endpoint (Input -> DB -> Output).
3.  **E2E Testing**: Menggunakan Playwright/Cypress untuk simulasi user login dan klik menu.
4.  **Manual Testing**: QA Checklist sebelum rilis fitur.

---

## 33. Deployment Strategy

Aplikasi siap dideploy ke platform modern:
- **Vercel**: Paling optimal untuk Next.js (Zero config).
- **VPS (Ubuntu/Docker)**: Menggunakan `Dockerfile` untuk containerization.
    - Build: `docker build -t attendance-app .`
    - Run: `docker run -p 3000:3000 attendance-app`

---

## 34. Environment Configuration

Wajib membuat file `.env` di root project:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/attendly_db"

# Auth
AUTH_SECRET="random_super_secret_string"
AUTH_URL="http://localhost:3000"

# Mailer
SMTP_HOST="smtp.gmail.com"
SMTP_USER="sekolah@email.com"
SMTP_PASS="app_password"
```

---

## 35. Backup & Recovery

Strategi Backup Database:
1.  **Automated Daily Backup**: Dump SQL setiap jam 00:00.
2.  **Retention Policy**: Simpan backup 7 hari terakhir, 4 minggu terakhir, 6 bulan terakhir.
3.  **Disaster Recovery**: Script restore siap pakai `npm run db:restore`.

---

## 36. FAQ Teknis

**Q: Mengapa data siswa di Admin kosong tapi di Guru ada?**
A: Terjadi karena kesalahan query API pada field `image` vs `avatar`. Sudah diperbaiki di patch 2.0.1.

**Q: Mengapa "Remember Me" tidak bekerja?**
A: Secara default sesi bertahan 30 hari (Jangka panjang). Checkbox hanya UI hint, namun konfigurasi `auth.ts` sudah diset `maxAge: 30 days`.

**Q: Bagaimana jika Tahun Ajaran baru dimulai?**
A: Admin gunakan menu "Tahun Ajaran", buat baru (misal 2026/2027 Ganjil), dan set "Aktif". Data siswa lama tetap ada history-nya (terkait relasi tahun ajaran di tabel nilai/absen).

---

## 37. Roadmap Pengembangan

- [x] Fase 1: Core System & Auth
- [x] Fase 2: Master Data CRUD
- [x] Fase 3: Absensi Dasar
- [x] Fase 4: Laporan PDF & Excel (Eksportir)
- [x] Fase 5: Landing Page CMS (Dynamic Content)
- [ ] Fase 6: Notifikasi WhatsApp
- [ ] Fase 7: Aplikasi Mobile Native (React Native)

---

## 38. Landing Page CMS (New Feature v2.1)

Sistem kini dilengkapi dengan **Content Management System (CMS)** penuh untuk Landing Page.
Administrator dapat mengelola konten publik tanpa menyentuh kode.

### Fitur CMS:
1.  **General Settings**: Ubah Judul Hero, Deskripsi, Teks Footer, dan Warna Tema.
2.  **Features Management**: Tambah/Edit/Hapus kartu fitur yang tampil.
3.  **Roles Showcase**: Atur daftar peran (Siswa, Guru, Admin) beserta benefitnya.
4.  **Announcements**: Posting pengumuman publik (Libur, Info PPDB) dengan tanggal berlaku.
5.  **FAQ Manager**: Kelola daftar pertanyaan umum.
6.  **How It Works**: Edit langkah-langkah penggunaan sistem.

### Akses CMS:
- **Menu**: Sidebar > "Landing CMS"
- **Role**: Hanya `SUPER_ADMIN` dan `ADMIN`.
- **Security**: Dilindungi oleh Server Actions dengan pengecekan Role dan Validasi Input.

---

**Copyright © 2026 ATTENDLY System Development Team.**
*Architecture by DracoSeven*
