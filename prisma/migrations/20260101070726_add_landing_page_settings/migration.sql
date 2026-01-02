-- CreateTable
CREATE TABLE "landing_page_settings" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'Selamat Datang di ATTENDLY',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Smart Attendance System untuk Sekolah Modern',
    "heroImage" TEXT,
    "aboutTitle" TEXT NOT NULL DEFAULT 'Tentang ATTENDLY',
    "aboutDescription" TEXT NOT NULL DEFAULT 'Sistem absensi terintegrasi untuk memudahkan pengelolaan kehadiran siswa dan guru.',
    "feature1Title" TEXT NOT NULL DEFAULT 'Absensi Digital',
    "feature1Desc" TEXT NOT NULL DEFAULT 'Rekam kehadiran secara digital dengan mudah dan akurat',
    "feature1Icon" TEXT NOT NULL DEFAULT 'ClipboardCheck',
    "feature2Title" TEXT NOT NULL DEFAULT 'Laporan Real-time',
    "feature2Desc" TEXT NOT NULL DEFAULT 'Pantau statistik kehadiran secara real-time',
    "feature2Icon" TEXT NOT NULL DEFAULT 'FileText',
    "feature3Title" TEXT NOT NULL DEFAULT 'Multi-Role',
    "feature3Desc" TEXT NOT NULL DEFAULT 'Akses berbeda untuk Admin, Guru, dan Siswa',
    "feature3Icon" TEXT NOT NULL DEFAULT 'Users',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactAddress" TEXT,
    "footerText" TEXT NOT NULL DEFAULT '© 2026 ATTENDLY. All rights reserved.',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_settings_pkey" PRIMARY KEY ("id")
);
