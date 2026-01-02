# 🎓 Sistem Informasi Akademik & Absensi Terpadu "Sekolah Cerdas"

> **Dokumentasi Arsitektural, Fungsional, dan Teknis untuk Pengelolaan Sekolah Menengah Terintegrasi**

![Versi Aplikasi](https.img.shields.io/badge/Versi%20Stabil-2.1.0-blue?style=for-the-badge&logo=appveyor)
![Status Pengembangan](https.img.shields.io/badge/Status-Pengembangan%20Aktif-green?style=for-the-badge&logo=github)
![Lisensi](https.img.shields.io/badge/Lisensi-Proprietary-red?style=for-the-badge)
![Kontak Dukungan](https.img.shields.io/badge/Dukungan-support@sekolahcerdas.id-lightgrey?style=for-the-badge&logo=-mail)

---

**Dokumen ini disusun oleh:**

*   **Nama:** (AI Language Model)
*   **Peran:** Senior Software Architect, Technical Writer, System Analyst
*   **Pengalaman:** 15+ Tahun dalam Arsitektur Sistem Skala Enterprise untuk Sektor Pendidikan.
*   **Tanggal Dokumen:** 2 Januari 2026

---

## 📂 Daftar Isi Dokumen

Dokumen ini dirancang untuk menjadi panduan komprehensif bagi berbagai pemangku kepentingan, mulai dari tim pengembang, administrator sistem, hingga manajemen sekolah.

1.  [**Pendahuluan Aplikasi**](#-1-pendahuluan-aplikasi)
    *   [1.1. Latar Belakang Masalah di Sekolah](#11-latar-belakang-masalah-di-sekolah)
    *   [1.2. Tujuan Pembuatan Sistem](#12-tujuan-pembuatan-sistem)
    *   [1.3. Ruang Lingkup Aplikasi](#13-ruang-lingkup-aplikasi)
    *   [1.4. Keunggulan Kompetitif](#14-keunggulan-kompetitif)
2.  [**Definisi Peran & Hak Akses (RBAC)**](#-2-definisi-peran--hak-akses-rbac)
    *   [2.1. Matriks Hak Akses Terperinci](#21-matriks-hak-akses-terperinci)
3.  [**Arsitektur Sistem**](#-3-arsitektur-sistem)
    *   [3.1. Filosofi Arsitektur](#31-filosofi-arsitektur)
    *   [3.2. Diagram Arsitektur Logis (ASCII)](#32-diagram-arsitektur-logis-ascii)
    *   [3.3. Arsitektur Frontend](#33-arsitektur-frontend)
    *   [3.4. Arsitektur Backend](#34-arsitektur-backend)
    *   [3.5. Arsitektur Database](#35-arsitektur-database)
4.  [**Teknologi yang Digunakan**](#-4-teknologi-yang-digunakan)
    *   [4.1. Tumpukan Teknologi (Tech Stack)](#41-tumpukan-teknologi-tech-stack)
    *   [4.2. Alasan Pemilihan Teknologi](#42-alasan-pemilihan-teknologi)
5.  [**Struktur Folder Proyek**](#-5-struktur-folder-proyek)
    *   [5.1. Struktur Frontend (Next.js)](#51-struktur-frontend-nextjs)
    *   [5.2. Struktur Backend (API Routes)](#52-struktur-backend-api-routes)
6.  [**Desain Database**](#-6-desain-database)
    *   [6.1. Diagram Relasi Entitas (ERD) (ASCII)](#61-diagram-relasi-entitas-erd-ascii)
    *   [6.2. Penjelasan Detail Setiap Tabel](#62-penjelasan-detail-setiap-tabel)
7.  [**Sistem Autentikasi & Otorisasi**](#-7-sistem-autentikasi--otorisasi)
    *   [7.1. Alur Login & Pembuatan Sesi (JWT)](#71-alur-login--pembuatan-sesi-jwt)
    *   [7.2. Middleware & Perlindungan Rute](#72-middleware--perlindungan-rute)
    *   [7.3. Sistem OTP & Verifikasi Email](#73-sistem-otp--verifikasi-email)
    *   [7.4. Hibrida Password Reset (Khusus Siswa)](#74-hibrida-password-reset-khusus-siswa)
    *   [7.5. Alur Lupa Password (Non-Siswa)](#75-alur-lupa-password-non-siswa)
    *   [7.6. Alur Perubahan Email & Verifikasi Ulang](#76-alur-perubahan-email--verifikasi-ulang)
8.  [**Modul Manajemen Akademik**](#-8-modul-manajemen-akademik)
    *   [8.1. Manajemen Kelas & Tahun Ajaran](#81-manajemen-kelas--tahun-ajaran)
    *   [8.2. Manajemen Mata Pelajaran](#82-manajemen-mata-pelajaran)
9.  [**Modul Penjadwalan Cerdas**](#-9-modul-penjadwalan-cerdas)
    *   [9.1. Algoritma Anti-Bentrok Jadwal (Zero-Conflict Algorithm)](#91-algoritma-anti-bentrok-jadwal-zero-conflict-algorithm)
    *   [9.2. Proses Pembuatan Jadwal Massal](#92-proses-pembuatan-jadwal-massal)
10. [**Modul Absensi Terpadu**](#-10-modul-absensi-terpadu)
    *   [10.1. Sistem Absensi Guru](#101-sistem-absensi-guru)
    *   [10.2. Sistem Absensi Siswa (per Mata Pelajaran)](#102-sistem-absensi-siswa-per-mata-pelajaran)
    *   [10.3. Validasi Waktu & Logika Status Absensi](#103-validasi-waktu--logika-status-absensi)
    *   [10.4. Manajemen Izin & Cuti](#104-manajemen-izin--cuti)
11. [**Dashboard & Analitika**](#-11-dashboard--analitika)
    *   [11.1. Komponen Dashboard per Peran](#111-komponen-dashboard-per-peran)
    *   [11.2. Prinsip UI/UX (Modern & Minimalist)](#112-prinsip-uiux-modern--minimalist)
12. [**Sistem Notifikasi Cerdas**](#-12-sistem-notifikasi-cerdas)
    *   [12.1. Arsitektur Notifikasi Real-time](#121-arsitektur-notifikasi-real-time)
13. [**Audit Log & Keamanan Sistem**](#-13-audit-log--keamanan-sistem)
    *   [13.1. Strategi Logging & Struktur Log](#131-strategi-logging--struktur-log)
    *   [13.2. Strategi Penanganan Error (Error Handling)](#132-strategi-penanganan-error-error-handling)
    *   [13.3. Praktik Terbaik Keamanan (Security Best Practices)](#133-praktik-terbaik-keamanan-security-best-practices)
14. [**Kinerja & Optimalisasi**](#-14-kinerja--optimalisasi)
    *   [14.1. Optimalisasi Frontend](#141-optimalisasi-frontend)
    *   [14.2. Optimalisasi Backend & Database](#142-optimalisasi-backend--database)
15. [**Dokumentasi API (Contoh)**](#-15-dokumentasi-api-contoh)
    *   [15.1. Contoh Request & Response](#151-contoh-request--response)
16. [**Diagram Alir & State Machine**](#-16-diagram-alir--state-machine)
    *   [16.1. State Machine Status Izin (Leave Request)](#161-state-machine-status-izin-leave-request)
17. [**Strategi Desain Mobile-First**](#-17-strategi-desain-mobile-first)
18. [**Strategi Pengujian (Testing)**](#-18-strategi-pengujian-testing)
19. [**Strategi Deployment**](#-19-strategi-deployment)
20. [**Konfigurasi Lingkungan (Environment)**](#-20-konfigurasi-lingkungan-environment)
21. [**Prosedur Pencadangan & Pemulihan (Backup & Recovery)**](#-21-prosedur-pencadangan--pemulihan-backup--recovery)
22. [**FAQ Teknis & Operasional**](#-22-faq-teknis--operasional)
23. [**Peta Jalan Pengembangan (Roadmap)**](#-23-peta-jalan-pengembangan-roadmap)
24. [**Lisensi & Hak Cipta**](#-24-lisensi--hak-cipta)

---

## 🚩 1. Pendahuluan Aplikasi

### 1.1. Latar Belakang Masalah di Sekolah

Institusi pendidikan menengah (SMP, SMA, SMK) di era digital menghadapi tantangan administrasi yang semakin kompleks. Proses manual yang masih banyak diterapkan terbukti tidak efisien, rawan kesalahan (human error), dan lambat dalam menyediakan data vital untuk pengambilan keputusan. Beberapa masalah inti yang kami identifikasi adalah:

*   **Administrasi Absensi yang Membebani:** Guru dan staf administrasi menghabiskan waktu berharga setiap hari untuk merekap absensi dari buku kelas ke sistem terpusat. Proses ini rentan terhadap kesalahan tulis, kehilangan data, dan memakan waktu yang seharusnya bisa digunakan untuk kegiatan belajar-mengajar yang lebih produktif.
*   **Penyusunan Jadwal yang Rumit dan Rentan Bentrok:** Membuat jadwal pelajaran tahunan adalah sebuah teka-teki raksasa. Koordinator kurikulum harus memastikan tidak ada guru yang mengajar di dua kelas berbeda pada saat yang sama, atau tidak ada kelas yang dijadwalkan untuk dua mata pelajaran sekaligus. Proses manual ini seringkali menghasilkan jadwal yang tidak optimal dan penuh konflik.
*   **Kesulitan Pemantauan Kinerja oleh Manajemen:** Kepala Sekolah dan jajaran manajemen kesulitan mendapatkan gambaran real-time tentang tingkat kehadiran guru dan siswa. Laporan seringkali bersifat reaktif (diberikan di akhir bulan), bukan proaktif, sehingga intervensi terhadap masalah kedisiplinan menjadi terlambat.
*   **Komunikasi Tidak Efektif antara Sekolah dan Orang Tua:** Proses permohonan izin siswa (sakit/keperluan lain) seringkali melalui alur yang tidak terstandarisasi, misalnya melalui surat fisik atau pesan singkat yang mudah terselip. Hal ini menyulitkan pelacakan dan validasi.
*   **Keamanan Data Siswa dan Staf:** Penyimpanan data sensitif di spreadsheet atau dokumen fisik merupakan risiko keamanan yang signifikan. Sistem yang terpusat dengan manajemen akses yang buruk dapat membahayakan privasi individu.

### 1.2. Tujuan Pembuatan Sistem

Aplikasi "Sekolah Cerdas" dirancang sebagai solusi holistik untuk mengatasi masalah-masalah di atas. Tujuan utama kami adalah:

*   **Digitalisasi & Otomatisasi:** Mengubah proses administrasi manual menjadi alur kerja digital yang terotomatisasi, mulai dari absensi, penjadwalan, hingga pelaporan. Tujuannya adalah membebaskan sumber daya manusia dari tugas repetitif dan mengurangi potensi *human error* hingga ke titik nol.
*   **Sentralisasi Data:** Menciptakan satu sumber kebenaran (Single Source of Truth) untuk semua data akademik dan administratif. Semua peran, dari siswa hingga kepala sekolah, akan mengakses data yang konsisten dan up-to-date sesuai dengan hak aksesnya.
*   **Peningkatan Akuntabilitas & Transparansi:** Menyediakan jejak digital (audit log) untuk setiap aktivitas penting dalam sistem. Hal ini meningkatkan akuntabilitas staf dan memberikan transparansi penuh kepada manajemen dan auditor.
*   **Pemberdayaan Pengambilan Keputusan Berbasis Data:** Menyajikan data absensi, kinerja, dan tren dalam bentuk dasbor analitik yang mudah dipahami. Kepala Sekolah dapat dengan cepat mengidentifikasi siswa atau guru yang memerlukan perhatian khusus, atau menganalisis efektivitas jadwal pelajaran.
*   **Peningkatan Keamanan dan Kepatuhan:** Mengimplementasikan standar keamanan modern untuk melindungi data pribadi seluruh warga sekolah, sejalan dengan peraturan privasi data yang berlaku.

### 1.3. Ruang Lingkup Aplikasi

Sistem ini mencakup fungsionalitas yang luas, dirancang untuk menjadi tulang punggung operasional sekolah:

*   **Manajemen Pengguna Multi-Peran:** Sistem dapat mengelola berbagai jenis pengguna dengan hak akses yang terdefinisi secara ketat (Superadmin, Admin, Guru, Wali Kelas, Siswa, Kepala Sekolah).
*   **Manajemen Akademik:** Pengelolaan data master seperti Tahun Ajaran, Kelas, Mata Pelajaran, dan data Siswa serta Guru.
*   **Penjadwalan Cerdas:** Modul untuk membuat dan mengelola jadwal pelajaran dengan validasi anti-bentrok secara otomatis.
*   **Absensi Terpadu:** Fitur absensi harian untuk guru dan absensi per mata pelajaran untuk siswa, lengkap dengan rekapitulasi dan statistik.
*   **Manajemen Izin & Cuti:** Alur kerja digital untuk pengajuan, persetujuan, dan penolakan izin sakit/cuti untuk siswa dan guru.
*   **Dasbor Analitik:** Dasbor yang disesuaikan untuk setiap peran guna menampilkan informasi yang relevan dan dapat ditindaklanjuti.
*   **Sistem Notifikasi:** Pemberitahuan dalam aplikasi (dan email) untuk kejadian penting (misalnya, permohonan izin baru, persetujuan cuti).
*   **Audit & Logging:** Pencatatan setiap aksi krusial yang terjadi di dalam sistem untuk keperluan audit dan keamanan.

### 1.4. Keunggulan Kompetitif

*   **Arsitektur Modern & Skalabel:** Dibangun di atas Next.js dan PostgreSQL, sistem ini menawarkan kinerja tinggi, keamanan, dan skalabilitas untuk menangani ribuan pengguna secara bersamaan.
*   **Pengalaman Pengguna (UX) yang Intuitif:** Desain antarmuka yang bersih, modern, dan responsif (mobile-first) memastikan adopsi yang mudah oleh pengguna dari berbagai latar belakang teknis.
*   **Fitur Keamanan Tingkat Lanjut:** Implementasi fitur seperti *Hybrid Password Reset* untuk siswa menunjukkan komitmen kami pada keamanan dan kemudahan penggunaan dalam konteks dunia pendidikan yang unik.
*   **Algoritma Penjadwalan Cerdas:** Kemampuan untuk mencegah konflik jadwal secara proaktif adalah keunggulan signifikan yang menghemat waktu dan tenaga administrator sekolah.

---

## 🛂 2. Definisi Peran & Hak Akses (RBAC)

Role-Based Access Control (RBAC) adalah fondasi keamanan aplikasi ini. Setiap peran memiliki cakupan tanggung jawab dan akses yang jelas untuk memastikan prinsip *least privilege* (hak akses minimum).

| Peran (Role)        | Deskripsi Tanggung Jawab                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Superadmin**      | Pengelola sistem tertinggi. Bertanggung jawab atas konfigurasi sistem inti, manajemen akun Admin, dan memiliki akses penuh ke seluruh data untuk tujuan darurat atau audit. Biasanya dipegang oleh tim IT developer. |
| **Admin**           | Operator harian sistem. Bertanggung jawab mengelola data master (siswa, guru, kelas, mata pelajaran), membuat user, dan mengelola tahun ajaran. |
| **Kepala Sekolah**  | Pemantau & Analis. Memiliki akses *read-only* ke seluruh data strategis: laporan absensi seluruh sekolah, statistik kinerja guru, dan data analitik lainnya. Dapat menyetujui cuti guru. |
| **Wali Kelas**      | Pembina kelas. Bertanggung jawab memantau kehadiran siswa di kelasnya, menyetujui izin siswa, dan melakukan reset password delegasi untuk siswanya. |
| **Guru**            | Pelaksana pengajaran. Bertanggung jawab mencatat kehadiran siswa pada setiap sesi mata pelajaran yang diampunya dan melihat jadwal mengajarnya sendiri. |
| **Siswa**           | Pengguna akhir. Dapat melihat jadwal pelajaran pribadi, riwayat absensi, dan mengajukan izin secara digital.                                             |

### 2.1. Matriks Hak Akses Terperinci

Tabel ini memetakan setiap aksi (fitur) ke peran yang diizinkan. C (Create), R (Read), U (Update), D (Delete), X (Execute).

| Fitur / Modul                           | Superadmin | Admin | Kpl. Sekolah | Wali Kelas | Guru  | Siswa |
| --------------------------------------- | :--------: | :---: | :----------: | :--------: | :---: | :---: |
| **Manajemen User**                      |   C,R,U,D  | C,R,U |      R       |     -      |   -   |   -   |
| **Manajemen Kelas & Mapel**             |   C,R,U,D  | C,R,U |      R       |     R      |   R   |   R   |
| **Manajemen Penjadwalan**               |   C,R,U,D  | C,R,U |      R       |     R      |   R   |   R   |
| **Mencatat Absensi Siswa**              |     -      |   -   |      -       |     -      |   X   |   -   |
| **Melihat Rekap Absensi (Kelas Sendiri)** |     R      |   R   |      R       |     R      |   R   |   R   |
| **Melihat Rekap Absensi (Semua Kelas)** |     R      |   R   |      R       |     -      |   -   |   -   |
| **Mengajukan Izin (Siswa)**             |     -      |   -   |      -       |     -      |   -   |   X   |
| **Menyetujui Izin (Siswa)**             |     -      |   -   |      -       |     X      |   -   |   -   |
| **Mengajukan Cuti (Guru)**              |     -      |   -   |      -       |     X      |   X   |   -   |
| **Menyetujui Cuti (Guru)**              |     -      |   -   |      X       |     -      |   -   |   -   |
| **Reset Password Delegasi (Siswa)**     |     -      |   -   |      -       |     X      |   -   |   -   |
| **Melihat Audit Log**                   |     R      |   R   |      -       |     -      |   -   |   -   |
| **Konfigurasi Sistem**                  |   C,R,U,D  |   -   |      -       |     -      |   -   |   -   |

---

## 🏗️ 3. Arsitektur Sistem

### 3.1. Filosofi Arsitektur

Arsitektur sistem ini dirancang dengan beberapa prinsip utama:

*   **Monolithic-First, Modular Design:** Kami mengadopsi pendekatan monolit dengan Next.js App Router, yang menyatukan frontend dan backend dalam satu codebase. Ini menyederhanakan pengembangan dan deployment awal. Namun, di dalam monolit ini, setiap fitur (absensi, penjadwalan, dll.) dibangun sebagai modul yang terisolasi secara logis untuk memfasilitasi pemeliharaan dan potensi pemisahan menjadi microservices di masa depan.
*   **Server-Centric Logic:** Sebagian besar logika bisnis, validasi, dan otorisasi dieksekusi di sisi server (baik melalui Server Components, API Routes, atau Server Actions). Ini meningkatkan keamanan dan memastikan konsistensi data.
*   **Performance & Scalability:** Pemanfaatan React Server Components (RSC) untuk rendering statis dan streaming, serta arsitektur backend stateless, memungkinkan sistem untuk melayani banyak pengguna dengan efisien dan mudah diskalakan secara horizontal.

### 3.2. Diagram Arsitektur Logis (ASCII)

Diagram berikut mengilustrasikan alur data dan interaksi antar komponen utama.

```
+---------------------------------------------------------------------------------+
|                                  Klien (Browser)                                |
|    +-------------------------------------------------------------------------+    |
|    |                      Antarmuka Pengguna (Next.js/React)                   |    |
|    |  [Dashboard] [Jadwal] [Form Absensi] [Laporan] [Pengaturan] [Login]       |    |
|    +-------------------------------------------------------------------------+    |
+---------------------------------|----------------^--------------------------------+
                                  | (HTTPS/WSS)    | (HTML, JS, CSS, Data JSON)
+---------------------------------v----------------|--------------------------------+
|                             Server Aplikasi (Next.js)                           |
| +-------------------------+ +-------------------------+ +-------------------------+ |
| |   Rendering Layer (RSC) | |    API Routes (REST)    | | Middleware (NextAuth.js)| |
| | - Halaman Statis/Dinamis| | - /api/students         | | - Verifikasi Token JWT  | |
| | - Streaming UI          | | - /api/attendance       | | - Otorisasi Peran (RBAC)| |
| | - Server Actions        | | - /api/schedules        | | - Redirect Halaman      | |
| +-------------------------+ +-------------------------+ +-------------------------+ |
|             |                           |                           |             |
|             +---------------------------+---------------------------+             |
|                                         |                                         |
|                       +-----------------v-----------------+                       |
|                       |  Lapisan Layanan & Logika Bisnis  |                       |
|                       | - Validasi Input (Zod)            |                       |
|                       | - Algoritma Anti-Bentrok          |                       |
|                       | - Kalkulasi Statistik Absensi     |                       |
|                       +-----------------------------------+                       |
|                                         | (Query)                                 |
|                               +---------v---------+                               |
|                               |    Prisma ORM     |                               |
|                               +-------------------+                               |
+---------------------------------|----------------^--------------------------------+
                                  | (TCP/IP)       | (Data Rows)
+---------------------------------v----------------|--------------------------------+
|                             Database (PostgreSQL)                                 |
|  [Tabel User] [Tabel Siswa] [Tabel Jadwal] [Tabel Absensi] [Tabel Log] ...        |
+---------------------------------------------------------------------------------+
| +--------------------------+      +---------------------------+                   |
| |   Layanan Eksternal      |      |     Penyimpanan File      |                   |
| | - SMTP (Nodemailer)      |      |   (e.g., S3, Local)       |                   |
| |   (Email Notifikasi/OTP) |      |   (Foto Surat Izin)       |                   |
| +--------------------------+      +---------------------------+                   |
+---------------------------------------------------------------------------------+
```

### 3.3. Arsitektur Frontend

*   **Framework:** Next.js 14+ dengan App Router.
*   **Komponen:** Mayoritas komponen adalah React Server Components (RSC) secara default. Ini berarti mereka di-render di server, menghasilkan HTML statis yang dikirim ke klien, mengurangi beban JavaScript di browser dan mempercepat *initial page load*.
*   **Interaktivitas:** Komponen yang membutuhkan interaksi pengguna (misalnya, form dengan state, tombol, chart dinamis) ditandai dengan direktif `"use client"`. Pendekatan ini memastikan hanya JavaScript yang benar-benar diperlukan yang dikirim ke browser.
*   **Styling:** TailwindCSS digunakan untuk styling dengan pendekatan *utility-first*. Ini mempercepat pengembangan UI dan menjaga konsistensi desain. `clsx` dan `tailwind-merge` digunakan untuk mengelola kelas kondisional secara dinamis.
*   **State Management:** Untuk state global yang kompleks, kami menghindari Redux atau Zustand demi kesederhanaan. Kami lebih mengandalkan:
    1.  **URL State:** Filter, paginasi, dan sorting dikelola melalui URL query params. Ini membuat state bisa di-bookmark dan dibagikan.
    2.  **React Context:** Untuk state sesi pengguna (misalnya, data user yang login).
    3.  **Server Actions:** Untuk mutasi data, kami menggunakan Server Actions yang terintegrasi dengan `useFormState` dan `useFormStatus` untuk menangani loading dan response state tanpa perlu menulis API endpoint manual.

### 3.4. Arsitektur Backend

*   **Runtime:** Node.js.
*   **Framework:** Backend dibangun menggunakan fitur bawaan Next.js (API Routes). Ini menghilangkan kebutuhan untuk server backend terpisah, menyederhanakan infrastruktur.
*   **API Design:** Kami mengadopsi gaya RESTful untuk API Routes kami (misalnya, `GET /api/users`, `POST /api/users`).
*   **Validasi:** Semua input yang masuk ke API atau Server Actions divalidasi secara ketat menggunakan **Zod**. Ini mencegah data yang tidak valid atau berbahaya masuk ke lapisan logika bisnis dan database.
*   **ORM (Object-Relational Mapping):** **Prisma** digunakan sebagai jembatan antara aplikasi Node.js dan database PostgreSQL. Keunggulan utamanya adalah *type safety*—setiap query database diperiksa pada saat kompilasi (compile-time), bukan saat runtime, yang secara drastis mengurangi bug terkait database.

### 3.5. Arsitektur Database

*   **Sistem Manajemen Database:** **PostgreSQL** dipilih karena reputasinya yang kuat dalam hal keandalan, integritas data, dan dukungan untuk tipe data serta query yang kompleks. Fitur seperti transaksi ACID (Atomicity, Consistency, Isolation, Durability) sangat penting untuk aplikasi finansial dan administratif seperti ini.
*   **Desain Schema:** Schema dirancang dengan prinsip normalisasi (umumnya hingga 3NF) untuk mengurangi redundansi data dan meningkatkan integritas. *Foreign key constraints* digunakan secara ekstensif untuk memastikan relasi antar tabel selalu valid di tingkat database.
*   **Migrasi:** **Prisma Migrate** adalah satu-satunya alat yang digunakan untuk mengelola perubahan skema database. Setiap perubahan (menambah tabel, kolom baru) dicatat dalam file migrasi SQL yang dapat dilacak versinya, memastikan konsistensi database di semua lingkungan (development, staging, production).

---

## 📂 5. Struktur Folder Proyek

Struktur folder yang terorganisir adalah kunci untuk pemeliharaan jangka panjang. Kami mengadopsi struktur berbasis fitur yang dikelompokkan dalam direktori App Router Next.js.

### 5.1. Struktur Frontend (Next.js)

```
/src
├── /app
│   ├── /api                  # Backend API Routes
│   ├── /(auth)               # Grup Rute untuk Autentikasi (tanpa segmen URL)
│   │   └── /login
│   │       └── page.tsx      # Halaman Login
│   ├── /(dashboard)          # Grup Rute untuk area yang memerlukan login
│   │   ├── layout.tsx        # Layout utama Dashboard (Sidebar, Header)
│   │   ├── /admin
│   │   │   ├── /users
│   │   │   │   └── page.tsx  # Halaman Manajemen User
│   │   │   └── ...
│   │   ├── /teacher
│   │   │   └── ...
│   │   └── /student
│   │       └── ...
│   ├── layout.tsx            # Layout root aplikasi
│   └── page.tsx              # Halaman landing/utama
│
├── /components               # Komponen React yang dapat digunakan kembali
│   ├── /ui                   # Komponen UI dasar (Button, Card, Input - dari shadcn)
│   ├── /dashboard            # Komponen spesifik untuk dashboard
│   └── /shared               # Komponen yang digunakan di banyak tempat
│
├── /lib                      # Kode utilitas & konfigurasi
│   ├── auth.ts               # Konfigurasi NextAuth.js
│   ├── prisma.ts             # Inisialisasi klien Prisma
│   ├── utils.ts              # Fungsi helper umum
│   └── validations.ts        # Skema validasi Zod
│
├── /prisma
│   ├── schema.prisma         # Definisi model database
│   └── /migrations           # Riwayat migrasi database
│
└── /public                   # Aset statis (gambar, font)
```

### 5.2. Struktur Backend (API Routes)

Struktur API mengikuti sumber daya yang mereka kelola.

```
/src/app/api
├── /auth
│   └── /[...nextauth]        # Handler dinamis untuk NextAuth.js
│       └── route.ts
├── /users
│   ├── /route.ts             # GET (list), POST (create)
│   └── /[id]
│       └── route.ts          # GET (detail), PATCH (update), DELETE
├── /schedules
│   └── /route.ts
└── /attendance
    └── /route.ts
```

---

## 🗃️ 6. Desain Database

### 6.1. Diagram Relasi Entitas (ERD) (ASCII)

Diagram ini menyajikan pandangan tingkat tinggi tentang bagaimana entitas utama saling berhubungan.

```
+---------------+      +-------------+      +-------------------+
|     User      |      |   Student   |      |       Class       |
|---------------|      |-------------|      |-------------------|
| id (PK)       |---<--| userId (FK) |      | id (PK)           |
| email         |      | nis         |      | name              |
| password      |      | nisn        |      | academicYearId(FK)|
| role          |      | classId(FK) |---<--| homeroomTeacherId |(FK,nullable)
| verified      |      +-------------+      +-------------------+      +----------------+
+---------------+             ^                     |                      | AcademicYear   |
      |                       |                     |                      |----------------|
      |                       |                     |                      | id (PK)        |
      |                       |                     v                      | year           |
+-------------+               |              +----------------+            | semester       |
|   Teacher   |               |              |   LeaveRequest |            | status         |
|-------------|               |              |----------------|            +----------------+
| userId (FK) |-->------------+--------------| id (PK)        |
| nip         |                              | studentId (FK) |-->---------+
| specialization|                              | reason         |
+-------------+                              | status         |
      |                                      | date           |
      v                                      +----------------+
+---------------+
|   Schedule    |
|---------------|
| id (PK)       |
| dayOfWeek     |
| startTime     |
| endTime       |
| classId (FK)  |--> (satu kelas punya banyak jadwal)
| subjectId (FK)|--> (satu mapel ada di banyak jadwal)
| teacherId (FK)|--> (satu guru punya banyak jadwal)
+---------------+
      |
      v
+-----------------------+
|   StudentAttendance   |
|-----------------------|
| id (PK)               |
| date                  |
| status                |
| scheduleId (FK)       |--> (satu jadwal punya banyak record absensi)
| studentId (FK)        |--> (satu siswa punya banyak record absensi)
+-----------------------+

+-----------------+
|    AuditLog     |
|-----------------|
| id (PK)         |
| actorId (FK)    | --> (User)
| action          |
| target          |
| timestamp       |
+-----------------+
```

*(Diagram disederhanakan untuk kejelasan. Relasi dan kunci asing yang sebenarnya lebih kompleks).*

### 6.2. Penjelasan Detail Setiap Tabel

*   **User:** Tabel sentral yang menyimpan informasi login untuk semua jenis pengguna.
    *   `role`: Enum (`SUPER_ADMIN`, `ADMIN`, `PRINCIPAL`, `TEACHER`, `HOMEROOM_TEACHER`, `STUDENT`) yang mengontrol hak akses.
    *   `verified`: Boolean, menandakan apakah email pengguna telah diverifikasi melalui OTP.
*   **Student:** Informasi spesifik siswa, terhubung ke satu `User` dan satu `Class`.
*   **Teacher:** Informasi spesifik guru, terhubung ke satu `User`.
*   **Class:** Entitas kelas (e.g., "X IPA 1"). Terhubung ke satu `AcademicYear` dan memiliki satu `homeroomTeacher` (wali kelas).
*   **AcademicYear:** Mendefinisikan tahun ajaran (e.g., "2025/2026 Ganjil"). Hanya ada satu yang boleh berstatus `ACTIVE`.
*   **Subject:** Tabel master untuk mata pelajaran.
*   **Schedule:** Entri jadwal pelajaran yang merupakan inti dari sistem. Menggabungkan `Class`, `Subject`, `Teacher` pada hari dan waktu tertentu. Constraint unik diberlakukan untuk mencegah bentrok.
*   **StudentAttendance:** Tabel transaksi yang mencatat status kehadiran (`PRESENT`, `LATE`, `SICK`, `PERMITTED`, `ABSENT`) seorang `Student` untuk sebuah `Schedule` pada `date` tertentu.
*   **LeaveRequest:** Mencatat permohonan izin dari siswa atau guru, lengkap dengan status persetujuan (`PENDING`, `APPROVED`, `REJECTED`).
*   **AuditLog:** Tabel penting untuk keamanan dan akuntabilitas. Mencatat setiap aksi signifikan yang dilakukan oleh pengguna.

---

## 🔐 7. Sistem Autentikasi & Otorisasi

### 7.1. Alur Login & Pembuatan Sesi (JWT)

1.  **Input Kredensial:** Pengguna memasukkan email dan password pada form login di sisi klien.
2.  **Request ke Server:** Form mengirimkan request `POST` ke endpoint `api/auth/signin` yang dikelola oleh NextAuth.js.
3.  **Validasi Kredensial:**
    *   NextAuth.js menerima request.
    *   Ia mencari `User` di database berdasarkan `email`.
    *   Jika user ditemukan, ia membandingkan password yang diinput dengan hash yang tersimpan di database menggunakan `bcrypt.compare()`.
4.  **Pembuatan Token:**
    *   Jika kredensial valid, NextAuth.js men-generate sebuah JSON Web Token (JWT).
    *   **Payload JWT** berisi informasi non-sensitif namun esensial: `userId`, `email`, `role`, `name`.
    *   Token ini ditandatangani dengan sebuah *secret key* yang hanya diketahui oleh server (`NEXTAUTH_SECRET`).
5.  **Pengiriman Sesi ke Klien:** JWT tersebut tidak dikirim langsung. NextAuth.js menyimpannya dalam cookie `httpOnly`, `secure` (di produksi). Ini mencegah akses token via JavaScript di browser (melindungi dari serangan XSS).
6.  **Penyimpanan Sesi di Klien:** Browser menyimpan cookie sesi. Untuk setiap request selanjutnya ke domain yang sama, browser akan secara otomatis menyertakan cookie ini.

### 7.2. Middleware & Perlindungan Rute

Middleware (`src/middleware.ts`) adalah garda terdepan aplikasi.

```typescript
// src/middleware.ts (Contoh Pseudocode)
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;

      // Jika tidak ada token (belum login)
      if (!token) return false;

      // Aturan untuk Admin
      if (pathname.startsWith('/admin')) {
        return token.role === 'ADMIN' || token.role === 'SUPER_ADMIN';
      }
      
      // Aturan untuk Guru
      if (pathname.startsWith('/teacher')) {
        return token.role === 'TEACHER' || token.role === 'HOMEROOM_TEACHER';
      }

      // ...aturan lainnya...
      
      return true; // Izinkan jika lolos semua aturan di atas
    }
  },
  pages: {
    signIn: '/login', // Halaman redirect jika tidak terotorisasi
    error: '/error',
  }
});
```

### 7.3. Sistem OTP & Email Verification

*   **Pembangkitan OTP:** Saat user baru mendaftar atau meminta verifikasi, sistem men-generate token acak 6 digit dan menyimpannya di tabel `VerificationToken` bersama `userId` dan `expiresAt`.
*   **Pengiriman Email:** Layanan email (Nodemailer) mengirimkan OTP ke email pengguna.
*   **Verifikasi:** Pengguna memasukkan OTP. Sistem memvalidasi token dari tabel, memastikan tidak kedaluwarsa dan cocok. Jika berhasil, field `User.verified` diubah menjadi `true`.

### 7.4. Hibrida Password Reset (Khusus Siswa)

Ini adalah fitur keamanan unik untuk mengatasi masalah siswa yang sering lupa password tanpa membebani Admin IT.

**Alur:**
1.  **Pelaporan:** Siswa melapor lupa password ke Wali Kelasnya.
2.  **Inisiasi Reset oleh Wali Kelas:**
    *   Wali Kelas membuka menu "Kelas Saya", memilih siswa, dan menekan tombol "Delegasi Reset Password".
    *   Sistem memverifikasi bahwa pengguna yang melakukan aksi adalah benar Wali Kelas dari siswa tersebut.
3.  **Pembangkitan Token Delegasi:**
    *   Backend men-generate sebuah token reset khusus (bukan OTP biasa) yang terikat pada `userId` siswa dan memiliki waktu kedaluwarsa singkat (misal, 15 menit).
    *   Token ini BUKAN password baru, melainkan sebuah kunci sekali pakai.
    *   Token ini ditampilkan di layar Wali Kelas.
4.  **Penggunaan Token oleh Siswa:**
    *   Wali Kelas memberikan token tersebut kepada siswa (misal, `RESET-A87F-9B2C`).
    *   Siswa pergi ke halaman login, memilih "Gunakan Token Reset".
    *   Siswa memasukkan **NIS (Nomor Induk Siswa)** dan **Token Delegasi**.
5.  **Validasi & Paksa Ganti Password:**
    *   Sistem memvalidasi NIS dan Token.
    *   Jika valid, siswa langsung diarahkan ke halaman untuk membuat **password baru**. Siswa tidak pernah login dengan password lama.
    *   Setelah password baru dibuat, token delegasi segera dihapus/dibatalkan.

**Keunggulan:**
*   **Keamanan:** Wali Kelas tidak pernah tahu atau mengatur password siswa.
*   **Desentralisasi:** Mengurangi beban kerja Admin.
*   **Akuntabilitas:** Aksi "Delegasi Reset" dicatat dalam `AuditLog`.

### 7.5. Alur Lupa Password (Non-Siswa)

Untuk Guru, Admin, dan Kepala Sekolah, alur reset password menggunakan standar industri berbasis email.
1. Pengguna memasukkan email di halaman "Lupa Password".
2. Sistem men-generate token reset yang unik dan berlaku singkat (misal, 1 jam).
3. Email dikirim ke pengguna berisi link unik yang mengandung token tersebut.
4. Pengguna mengklik link, divalidasi oleh sistem, lalu diarahkan ke halaman pembuatan password baru.

### 7.6. Alur Perubahan Email & Verifikasi Ulang
Pengguna dapat mengubah alamat email mereka melalui halaman profil. Untuk keamanan, proses ini memerlukan verifikasi dua langkah:
1. Pengguna memasukkan email baru.
2. Sistem mengirimkan OTP ke **email baru** tersebut.
3. Pengguna memasukkan OTP untuk mengkonfirmasi kepemilikan email baru.
4. Setelah verifikasi berhasil, alamat email di tabel `User` diperbarui dan status `verified` di-reset menjadi `false` hingga OTP baru dimasukkan. Sesi login saat ini tetap aktif, namun untuk aksi-aksi kritikal berikutnya, verifikasi mungkin diperlukan lagi.

---

## 🏛️ 8. Modul Manajemen Akademik

Modul ini adalah fondasi data master yang menopang seluruh operasional aplikasi. Kesalahan pada data di sini akan berdampak ke seluruh sistem.

### 8.1. Manajemen Kelas & Tahun Ajaran
*   **Tahun Ajaran (AcademicYear):** Entitas ini (`2025/2026 Ganjil`, `2025/2026 Genap`) berfungsi sebagai "kontainer" waktu. Hanya satu `AcademicYear` yang bisa berstatus `ACTIVE` pada satu waktu. Semua jadwal, kelas, dan absensi terikat pada tahun ajaran yang aktif. Ini memungkinkan sekolah untuk mempersiapkan data tahun ajaran berikutnya tanpa mengganggu operasional yang sedang berjalan. Admin dapat mengganti status tahun ajaran, yang secara efektif akan "membalik halaman" ke semester atau tahun baru.
*   **Kelas (Class):** Dikelola oleh Admin. Sebuah kelas (`XII IPA 1`) harus terikat pada satu tahun ajaran. Admin juga menunjuk seorang `Teacher` untuk menjadi `homeroomTeacher` (Wali Kelas). Kenaikan kelas di akhir tahun ajaran dilakukan dengan script khusus yang memindahkan siswa dari kelas lama ke kelas baru dan mengarsip kelas lama.

### 8.2. Manajemen Mata Pelajaran
*   **Mata Pelajaran (Subject):** Tabel master sederhana yang berisi nama mata pelajaran (`Matematika Wajib`, `Fisika`, `Sejarah Indonesia`). Data ini digunakan di seluruh sistem, terutama dalam pembuatan jadwal. Admin dapat menambah atau menonaktifkan mata pelajaran sesuai kurikulum yang berlaku.

---

## 🗓️ 9. Modul Penjadwalan Cerdas

Ini adalah salah satu modul paling kompleks dan bernilai tinggi. Tujuannya adalah untuk mengotomatiskan dan memvalidasi proses pembuatan jadwal yang rumit.

### 9.1. Algoritma Anti-Bentrok Jadwal (Zero-Conflict Algorithm)
Setiap kali Admin mencoba membuat atau mengupdate sebuah entri `Schedule`, sebuah validasi ketat dijalankan di backend sebelum data disimpan ke database. Algoritma ini memeriksa tiga potensi konflik utama dalam satu transaksi database untuk memastikan atomicity.

**Pseudocode Validasi:**
```typescript
async function validateSchedule(input: {
  day: DayOfWeek,
  startTime: Time,
  endTime: Time,
  classId: string,
  teacherId: string,
  roomId: string, // Misalkan ada field roomId
}) {
  // 1. Cek Konflik Guru: Apakah guru ini sudah mengajar di tempat lain pada waktu yang sama?
  const teacherConflict = await prisma.schedule.findFirst({
    where: {
      teacherId: input.teacherId,
      day: input.day,
      // Logika overlap waktu
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    }
  });
  if (teacherConflict) {
    throw new Error(`Konflik: Guru sudah ada jadwal lain pada waktu ini.`);
  }

  // 2. Cek Konflik Kelas: Apakah kelas ini sudah memiliki pelajaran lain pada waktu yang sama?
  const classConflict = await prisma.schedule.findFirst({
    where: {
      classId: input.classId,
      day: input.day,
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    }
  });
  if (classConflict) {
    throw new Error(`Konflik: Kelas sudah ada jadwal lain pada waktu ini.`);
  }

  // 3. Cek Konflik Ruangan: Apakah ruangan ini sudah dipakai oleh kelas lain pada waktu yang sama?
  const roomConflict = await prisma.schedule.findFirst({
    where: {
      roomId: input.roomId,
      day: input.day,
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    }
  });
  if (roomConflict) {
    throw new Error(`Konflik: Ruangan sudah digunakan pada waktu ini.`);
  }

  return true; // Tidak ada konflik
}
```
Pengecekan ini memastikan integritas jadwal jauh lebih baik daripada proses manual.

### 9.2. Proses Pembuatan Jadwal Massal
Untuk efisiensi, Admin dapat mengunggah file CSV/Excel yang berisi ratusan baris jadwal. Sistem akan memproses file ini baris per baris, menjalankan `validateSchedule` untuk setiap entri. Hasil proses akan ditampilkan dalam bentuk laporan:
*   **Berhasil:** Daftar jadwal yang sukses dibuat.
*   **Gagal:** Daftar jadwal yang gagal beserta alasan konfliknya (e.g., "Baris 23: Konflik Guru 'Budi Santoso'").
Admin kemudian dapat memperbaiki file CSV dan mengunggah ulang hanya bagian yang gagal.

---

## ✅ 10. Modul Absensi Terpadu

### 10.1. Sistem Absensi Guru
Absensi guru lebih sederhana, biasanya berbasis check-in harian.
*   **Mekanisme:** Guru melakukan check-in saat tiba di sekolah (bisa melalui aplikasi atau perangkat khusus). Sistem mencatat `teacherId` dan `timestamp`.
*   **Laporan:** Kepala Sekolah dapat melihat dasbor kehadiran guru secara real-time, persentase keterlambatan, dan rekapitulasi bulanan.

### 10.2. Sistem Absensi Siswa (per Mata Pelajaran)
Ini adalah inti dari modul absensi.
*   **Antarmuka Guru:** Pada saat jam mengajar, di dasbor guru akan muncul jadwal yang sedang berlangsung. Dengan mengklik jadwal tersebut, guru diarahkan ke halaman absensi.
*   **Halaman Absensi:** Halaman ini menampilkan daftar siswa yang terdaftar di kelas tersebut. Untuk setiap siswa, terdapat pilihan status: `Hadir`, `Terlambat`, `Sakit`, `Izin`, `Alpa`.
*   **Logika Bisnis:**
    *   Jika seorang siswa memiliki `LeaveRequest` yang sudah `APPROVED` untuk hari itu, statusnya akan terkunci sebagai `Sakit` atau `Izin`, dan guru tidak dapat mengubahnya.
    *   Saat guru menekan "Simpan", sistem membuat/memperbarui entri di tabel `StudentAttendance` untuk setiap siswa. Kunci unik pada `(studentId, scheduleId, date)` mencegah data ganda.

### 10.3. Validasi Waktu & Logika Status Absensi
*   **Jendela Absensi:** Guru hanya dapat mengisi absensi dalam rentang waktu yang wajar dari jadwal, misalnya dari 15 menit sebelum pelajaran dimulai hingga 15 menit setelah pelajaran berakhir. Di luar jendela ini, form absensi akan dinonaktifkan.
*   **Penentuan Status 'Terlambat':** Sistem memiliki ambang batas keterlambatan yang dapat dikonfigurasi (misalnya, 10 menit setelah jam pelajaran dimulai). Jika guru mencatat kehadiran siswa setelah ambang batas ini, sistem akan secara otomatis menyarankan status `Terlambat` (LATE), meskipun guru tetap bisa mengubahnya secara manual dengan justifikasi.

### 10.4. Manajemen Izin & Cuti
*   **Pengajuan oleh Siswa/Guru:** Pengguna mengisi form pengajuan izin/cuti, memilih rentang tanggal, memberikan alasan, dan dapat mengunggah file pendukung (misalnya, foto surat dokter).
*   **Alur Persetujuan:**
    *   Izin Siswa: Notifikasi dikirim ke Wali Kelas. Wali Kelas dapat `Menyetujui` atau `Menolak` dari dasbornya.
    *   Cuti Guru: Notifikasi dikirim ke Kepala Sekolah untuk persetujuan.
*   **Integrasi:** Setelah disetujui, sistem secara otomatis akan menggunakan status ini pada saat pengisian absensi yang relevan.

---

## 📊 11. Dashboard & Analitika

Setiap peran mendapatkan dasbor yang dirancang khusus untuk kebutuhannya, memberikan "snapshot" informasi yang paling relevan.

### 11.1. Komponen Dashboard per Peran
*   **Admin:** Statistik jumlah pengguna, kelas, jadwal. Log aktivitas terbaru. Tombol shortcut untuk fungsi-fungsi utama (tambah user, buat jadwal).
*   **Kepala Sekolah:** Grafik tren kehadiran siswa dan guru (harian, mingguan, bulanan). Daftar guru dengan tingkat absensi tertinggi/terendah. Notifikasi persetujuan cuti yang menunggu.
*   **Wali Kelas:** Persentase kehadiran kelasnya. Daftar siswa dengan kehadiran di bawah ambang batas (misal, < 90%). Daftar izin siswa yang menunggu persetujuan.
*   **Guru:** Jadwal mengajar hari ini. Notifikasi jika ada kelas yang akan diajar dalam 15 menit. Statistik kehadiran pada mata pelajaran yang diampunya.
*   **Siswa:** Jadwal pelajaran hari ini. Ringkasan status kehadiran pribadi (jumlah hadir, sakit, alpa).

### 11.2. Prinsip UI/UX (Modern & Minimalist)
*   **Clarity over Clutter:** Antarmuka dirancang untuk tidak membanjiri pengguna dengan informasi. Data disajikan dalam "kartu" (cards) yang jelas dan ringkas.
*   **Responsive & Mobile-First:** Desain dibuat dari layar mobile terlebih dahulu, lalu diadaptasikan ke layar yang lebih besar. Ini memastikan pengalaman yang optimal bagi guru yang sering mengakses via smartphone.
*   **Konsistensi:** Penggunaan library komponen `shadcn/ui` memastikan semua elemen interaktif (tombol, form, dialog) memiliki tampilan dan perilaku yang konsisten di seluruh aplikasi.
*   **Aksesibilitas (A11y):** Mengikuti standar WCAG. Kontras warna yang cukup, navigasi keyboard yang logis, dan penggunaan atribut ARIA yang tepat.

---

## 🔔 12. Sistem Notifikasi Cerdas

Sistem notifikasi bertujuan untuk menyampaikan informasi penting secara proaktif kepada pengguna yang tepat.

### 12.1. Arsitektur Notifikasi
*   **Pemicu (Triggers):** Aksi-aksi di backend (misalnya, `createLeaveRequest`, `approveLeaveRequest`, `createSchedule`) memanggil sebuah `NotificationService`.
*   **NotificationService:** Layanan ini bertanggung jawab untuk:
    1.  Menentukan siapa penerima notifikasi.
    2.  Membuat pesan notifikasi.
    3.  Menyimpan notifikasi ke tabel `Notification` di database.
    4.  (Opsional) Mendorong notifikasi real-time ke klien.
    5.  Mengirim email melalui `MailService`.
*   **Tampilan di UI:** Pengguna memiliki ikon lonceng di header. Jika ada notifikasi baru, ikon akan menampilkan badge. Mengklik ikon akan membuka daftar notifikasi yang relevan.

**Contoh Alur Notifikasi:**
1. Siswa A mengajukan izin.
2. `LeaveRequestController` memanggil `NotificationService.send({ type: 'NEW_LEAVE_REQUEST', data: ... })`.
3. `NotificationService` mencari Wali Kelas dari Siswa A, yaitu Guru B.
4. Notifikasi disimpan ke DB: `{ recipientId: Guru_B_Id, message: 'Siswa A mengajukan izin', link: '/approvals/leave/123' }`.
5. Email dikirim ke Guru B.

---

## 🛡️ 13. Audit Log & Keamanan Sistem

### 13.1. Strategi Logging & Struktur Log
Setiap aksi yang mengubah data (Create, Update, Delete) atau aksi sensitif lainnya (Login, Logout, Export Data) wajib dicatat dalam tabel `AuditLog`.

**Struktur Data Log:**
*   `id`: UUID
*   `timestamp`: Waktu aksi terjadi.
*   `actorId`: ID pengguna yang melakukan aksi.
*   `actorEmail`: Email pengguna (untuk kemudahan pembacaan).
*   `action`: Aksi yang dilakukan (e.g., `USER_CREATE`, `SCHEDULE_DELETE`, `PASSWORD_RESET_DELEGATED`).
*   `targetId`: ID entitas yang menjadi target (e.g., ID user yang baru dibuat).
*   `details`: JSONB field untuk menyimpan data tambahan (e.g., data lama vs data baru pada saat update).

Admin dapat melihat dan memfilter log ini melalui antarmuka khusus.

### 13.2. Strategi Penanganan Error (Error Handling)
*   **Error Terduga (Expected):** Kesalahan validasi atau bisnis (e.g., "Jadwal bentrok") ditangani secara elegan. Backend mengirimkan status `400 Bad Request` atau `409 Conflict` dengan pesan error yang jelas. Frontend menampilkan pesan ini kepada pengguna melalui komponen `Toast` atau `Alert`.
*   **Error Tak Terduga (Unexpected):** Jika terjadi error server (500), pengguna hanya akan melihat pesan generik ("Terjadi kesalahan pada server"). Namun, di backend, error tersebut dicatat secara detail ke sistem logging (e.g., Sentry, Logtail) lengkap dengan *stack trace* untuk dianalisis oleh developer.

### 13.3. Praktik Terbaik Keamanan (Security Best Practices)
*   **SQL Injection:** Dicegah sepenuhnya oleh penggunaan Prisma ORM, yang mem-parameterisasi semua query.
*   **Cross-Site Scripting (XSS):** Dicegah oleh React yang secara default melakukan *escaping* pada semua data yang di-render.
*   **Cross-Site Request Forgery (CSRF):** Dilindungi oleh NextAuth.js yang menggunakan *double submit cookie pattern*.
*   **Keamanan Header HTTP:** Implementasi header seperti `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security` untuk mengeraskan keamanan di sisi klien.
*   **Rate Limiting:** Menerapkan pembatasan jumlah request pada endpoint-endpoint sensitif (login, lupa password) untuk mencegah serangan brute-force.

---
*(Melanjutkan ke bagian berikutnya)*
---
## ⚡ 14. Kinerja & Optimalisasi

Kinerja adalah fitur. Aplikasi yang lambat akan ditinggalkan pengguna.

### 14.1. Optimalisasi Frontend
*   **Code Splitting:** Next.js App Router secara otomatis melakukan code splitting per halaman. Hanya kode yang diperlukan untuk halaman tertentu yang dimuat.
*   **Lazy Loading:** Komponen berat yang tidak terlihat di viewport awal (misalnya, modal, chart di bagian bawah halaman) di-load secara dinamis menggunakan `next/dynamic`.
*   **Image Optimization:** Penggunaan komponen `next/image` untuk mengoptimalkan gambar secara otomatis (konversi ke WebP, resizing, lazy loading).
*   **Caching:** Pemanfaatan caching di sisi server (RSC Payload) dan di sisi klien (Next.js Router Cache) untuk meminimalkan request berulang. Halaman yang semi-statis (seperti daftar mata pelajaran) dapat di-cache untuk periode yang lebih lama.

### 14.2. Optimalisasi Backend & Database
*   **Indexing:** Semua kolom yang sering digunakan untuk filtering atau sorting (seperti `date` di `StudentAttendance`, `status` di `LeaveRequest`, `email` di `User`) diindeks di level database untuk mempercepat query `WHERE`.
*   **Query Selektif:** Menghindari `SELECT *`. Prisma memudahkan untuk hanya memilih kolom yang benar-benar dibutuhkan (`select: { id: true, name: true }`), mengurangi transfer data antara database dan server.
*   **N+1 Problem:** Penggunaan `include` atau `select` bersarang di Prisma untuk melakukan eager loading data relasi dalam satu query, menghindari masalah N+1 query yang umum terjadi pada ORM.
*   **Pagination:** Menerapkan pagination (menggunakan `take` dan `skip` di Prisma) pada semua list yang berpotensi memiliki banyak data (daftar siswa, riwayat absensi, audit log).

---

## 📜 15. Dokumentasi API (Contoh)

Meskipun banyak mutasi data menggunakan Server Actions, API Routes tetap penting untuk interaksi dari klien atau sistem eksternal.

### 15.1. Contoh Request & Response

**Endpoint:** `GET /api/classes/{classId}/students`
**Deskripsi:** Mengambil daftar siswa dalam sebuah kelas.
**Otorisasi:** Memerlukan token (semua peran yang login dapat mengakses).

**Response Sukses (200 OK):**
```json
{
  "data": [
    {
      "studentId": "clt9q5j9s000108l4f0d2h2g0",
      "nis": "2024001",
      "user": {
        "name": "Ahmad Budi",
        "email": "ahmad.budi@sekolah.sch.id"
      }
    },
    {
      "studentId": "clt9q5j9t000208l4g8h9c1j1",
      "nis": "2024002",
      "user": {
        "name": "Citra Lestari",
        "email": "citra.lestari@sekolah.sch.id"
      }
    }
  ],
  "meta": {
    "total": 35,
    "page": 1,
    "limit": 10
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "error": "Kelas dengan ID 'xyz' tidak ditemukan."
}
```
---
## 🌊 16. Diagram Alir & State Machine

Visualisasi alur membantu memahami logika bisnis yang kompleks.

### 16.1. State Machine Status Izin (LeaveRequest)
Diagram ini menunjukkan transisi status dari sebuah permohonan izin.

```
          [Siswa Mengajukan]
                 |
                 v
        +----------------+
        |    PENDING     |
        +----------------+
                 |
     +-----------+-----------+
     | [Wali Kelas Menolak]  | [Wali Kelas Menyetujui]
     v                       v
+------------+         +-------------+
|  REJECTED  |         |  APPROVED   |
+------------+         +-------------+
     ^                       ^
     | [Siswa Membatalkan]   |
     +-----------------------+
```
Setiap transisi status ini dicatat dalam `AuditLog`.

---

## 📱 17. Strategi Desain Mobile-First

*   **Grid & Flexbox:** Menggunakan sistem grid dan flexbox dari TailwindCSS untuk membuat layout yang cair dan mudah beradaptasi.
*   **Navigasi Mobile:** Pada layar kecil, sidebar navigasi utama akan tersembunyi di balik "hamburger menu" untuk menghemat ruang.
*   **Ukuran Target Sentuh:** Semua elemen interaktif (tombol, link) memiliki ukuran minimum 44x44 piksel untuk kemudahan sentuhan jari.
*   **Input Mobile:** Menggunakan tipe input HTML5 yang sesuai (`type="email"`, `type="date"`) untuk memunculkan keyboard yang optimal di perangkat mobile.

---

## 🧪 18. Strategi Pengujian (Testing)

*   **Unit Testing (Jest):** Menguji fungsi-fungsi utilitas murni dan logika bisnis yang terisolasi (misalnya, fungsi kalkulasi statistik, validasi).
*   **Integration Testing (Jest & Prisma Test Environment):** Menguji interaksi antara layanan dan database. Setiap test case berjalan dalam transaksi database terisolasi yang akan di-rollback setelahnya, sehingga tidak mengotori database pengembangan.
*   **End-to-End (E2E) Testing (Cypress/Playwright):** Mensimulasikan alur kerja pengguna secara lengkap di browser. Contoh: test case untuk "Guru berhasil login, membuka halaman absensi, mengisi data, dan menyimpan". Test ini berjalan pada database terpisah yang di-seed khusus untuk E2E.

---

## 🚀 19. Strategi Deployment

*   **Platform:** Vercel adalah pilihan utama karena integrasinya yang mulus dengan Next.js.
*   **Alur CI/CD:**
    1. Developer melakukan `git push` ke branch fitur.
    2. Vercel secara otomatis membuat "Preview Deployment" dengan URL unik. Tim dapat mereview perubahan di lingkungan yang terisolasi.
    3. Setelah Pull Request di-merge ke `main` branch, Vercel secara otomatis menjalankan build produksi dan mendeploy-nya.
*   **Zero Downtime:** Deployment di Vercel bersifat atomik. Traffic tidak akan dialihkan ke build baru sampai build tersebut benar-benar siap, memastikan tidak ada downtime.

---

## ⚙️ 20. Konfigurasi Lingkungan (Environment)

Aplikasi menggunakan variabel lingkungan untuk konfigurasi, yang dikelola dalam file `.env`.

**Contoh `.env.example`:**
```
# Database
DATABASE_URL="postgresql://user:password@host:port/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="kunci_rahasia_yang_sangat_panjang_dan_aman"

# SMTP (Email)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@sekolahcerdas.id"

# Batas Keterlambatan (menit)
ATTENDANCE_LATE_THRESHOLD=15
```

---

## 💾 21. Prosedur Pencadangan & Pemulihan (Backup & Recovery)

*   **Pencadangan (Backup):**
    *   **Database:** Menggunakan fitur Point-in-Time Recovery (PITR) dari penyedia hosting database (e.g., Supabase, Neon, AWS RDS). Backup otomatis dilakukan setiap hari.
    *   **File Unggahan:** Jika file disimpan di S3 atau sejenisnya, versi dan backup diaktifkan di level bucket.
*   **Pemulihan (Recovery):**
    *   Prosedur pemulihan didokumentasikan dan diuji secara berkala.
    *   **Skenario 1 (Kerusakan Kecil):** Memulihkan data dari snapshot database beberapa jam sebelumnya.
    *   **Skenario 2 (Bencana):** Memulihkan database dari backup harian terakhir ke region geografis yang berbeda.

---

## ❓ 22. FAQ Teknis & Operasional

*   **T: Bagaimana jika Admin lupa passwordnya?**
    *   **J:** Superadmin dapat mereset password Admin dari antarmukanya. Jika Superadmin lupa, intervensi manual di level database oleh tim developer diperlukan.
*   **T: Apa yang terjadi saat pergantian tahun ajaran?**
    *   **J:** Admin menjalankan script "Kenaikan Kelas". Script ini akan mempromosikan siswa ke tingkat berikutnya (e.g., dari X-A ke XI-A), mengosongkan kelas XII, dan mengarsipkan tahun ajaran lama menjadi `INACTIVE`.
*   **T: Bisakah sistem ini diintegrasikan dengan sistem fingerprint yang sudah ada?**
    *   **J:** Ya, secara konseptual. Perangkat fingerprint harus bisa mengirimkan request HTTP ke sebuah endpoint API khusus di aplikasi kita, berisi `teacherId` dan `timestamp`. Ini memerlukan pengembangan tambahan.

---

## 🗺️ 23. Peta Jalan Pengembangan (Roadmap)

**Q1 2026 (Fokus Kinerja & Stabilitas):**
*   [ ] Implementasi caching yang lebih agresif untuk data master.
*   [ ] Refactoring komponen UI besar untuk meningkatkan performa.
*   [ ] Penambahan cakupan test E2E.

**Q2 2026 (Fitur Wali Murid):**
*   [ ] Membuat peran "Wali Murid" dengan dasbor khusus.
*   [ ] Integrasi Notifikasi WhatsApp untuk laporan absensi harian ke wali murid.

**Q3 2026 (Gamifikasi & Keterlibatan Siswa):**
*   [ ] Modul gamifikasi: Poin, lencana, dan papan peringkat untuk kehadiran.
*   [ ] Dasbor siswa yang lebih interaktif dengan visualisasi progres.

---

---
dracoseven
---
