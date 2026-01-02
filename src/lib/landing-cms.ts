import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { cache } from "react";

// Types for our CMS data
export interface LandingData {
  settings: any;
  features: any[];
  roles: any[];
  announcements: any[];
  faqs: any[];
  howItWorks: any[];
  stats?: {
    students: number;
    teachers: number;
    classes: number;
  };
}

export const getLandingData = cache(async (): Promise<LandingData> => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      settings: {},
      features: [],
      roles: [],
      announcements: [],
      faqs: [],
      howItWorks: [],
    };
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const [
      settings,
      features,
      roles,
      announcements,
      faqs,
      howItWorks,
      studentsCount,
      teachersCount,
      classesCount
    ] = await Promise.all([
      prisma.landingPageSettings.findFirst(),
      prisma.landingFeature.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.landingRole.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.landingAnnouncement.findMany({
        where: { isActive: true },
        orderBy: { startDate: "desc" },
        take: 5
      }),
      prisma.landingFAQ.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.landingHowItWorks.findMany({ where: { isActive: true }, orderBy: { stepNumber: "asc" } }),
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.teacher.count({ where: { status: "ACTIVE" } }),
      prisma.class.count(),
    ]);

    // Create default settings if not exists (lazy init)
    if (!settings) {
      await prisma.landingPageSettings.create({ data: {} });
    }

    // --- DEFAULTS INJECTION (If DB is empty) ---
    const defaultFeatures = [
      { id: "d1", title: "Real-Time Sync", description: "Data kehadiran terupdate secara instan ke seluruh sistem.", icon: "Zap" },
      { id: "d2", title: "Biometric & QR", description: "Dukungan untuk berbagai metode input presensi.", icon: "Scan" },
      { id: "d3", title: "Notifikasi WA", description: "Kirim laporan kehadiran otomatis ke orang tua.", icon: "Bell" },
      { id: "d4", title: "Analitik Data", description: "Insight mendalam tentang kedisiplinan siswa.", icon: "BarChart" },
      { id: "d5", title: "Akses Mobile", description: "Pantau kehadiran dari mana saja melalui smartphone.", icon: "Smartphone" },
      { id: "d6", title: "Keamanan Data", description: "Enkripsi end-to-end untuk privasi siswa.", icon: "Shield" },
    ];

    const defaultRoles = [
      {
        id: "r1",
        title: "Administrator",
        description: "Kontrol penuh atas data sekolah, manajemen user, dan konfigurasi sistem.",
        icon: "Settings",
        benefits: ["Dashboard Pusat", "Manajemen User", "Laporan Lengkap"]
      },
      {
        id: "r2",
        title: "Guru",
        description: "Kelola kelas, input nilai, dan pantau kehadiran siswa dengan mudah.",
        icon: "BookOpen",
        benefits: ["Jurnal Kelas", "Input Nilai", "Monitoring Siswa"]
      },
      {
        id: "r3",
        title: "Siswa & Ortu",
        description: "Akses riwayat kehadiran dan pengumuman sekolah secara transparan.",
        icon: "Users",
        benefits: ["Cek Kehadiran", "Lihat Jadwal", "Notifikasi"]
      },
      {
        id: "r4",
        title: "Kepala Sekolah",
        description: "Pantau performa sekolah secara makro untuk pengambilan keputusan.",
        icon: "TrendingUp",
        benefits: ["Eksekutif Summary", "Statistik Guru", "Evaluasi Kinerja"]
      },
    ];

    const defaultHowItWorks = [
      { id: "h1", title: "Input Data", description: "Siswa melakukan absensi via QR/Kartu/Manual.", icon: "LogIn" },
      { id: "h2", title: "Proses Sistem", description: "Sistem memvalidasi dan mencatat waktu kehadiran.", icon: "Cpu" },
      { id: "h3", title: "Notifikasi", description: "Notifikasi terkirim ke Orang Tua & Dashboard Guru.", icon: "Send" },
      { id: "h4", title: "Pelaporan", description: "Data tersaji dalam laporan harian/bulanan otomatis.", icon: "FileText" },
    ];

    const defaultFaqs = [
      { id: "f1", question: "Apakah sistem ini berbayar?", answer: "Attendly memiliki versi gratis untuk sekolah kecil dan versi Pro untuk fitur lebih lengkap." },
      { id: "f2", question: "Bagaimana cara reset password?", answer: "Hubungi administrator sekolah untuk melakukan reset password akun Anda." },
      { id: "f3", question: "Apakah data siswa aman?", answer: "Ya, kami menggunakan standar enkripsi industri untuk melindungi seluruh data sensitif." },
      { id: "f4", question: "Bisa diakses dari HP?", answer: "Tentu, tampilan Attendly responsif dan optimal untuk semua perangkat mobile." },
    ];

    const defaultAnnouncements = [
      {
        id: "a1",
        title: "Update Sistem v2.0",
        content: "Peningkatan performa dan tampilan baru telah dirilis.",
        startDate: new Date(),
        type: "INFO"
      },
      {
        id: "a2",
        title: "Libur Semester",
        content: "Libur semester ganjil dimulai tanggal 20 Desember.",
        startDate: new Date(),
        type: "IMPORTANT"
      }
    ];

    return {
      settings: settings || {},
      features: features.length > 0 ? features : defaultFeatures,
      roles: roles.length > 0 ? roles : defaultRoles,
      announcements: announcements.length > 0 ? announcements : defaultAnnouncements,
      faqs: faqs.length > 0 ? faqs : defaultFaqs,
      howItWorks: howItWorks.length > 0 ? howItWorks : defaultHowItWorks,
      stats: {
        students: studentsCount || 266, // Fallback to seeded count if fetch fails but unlikely
        teachers: teachersCount || 15,
        classes: classesCount || 10,
      }
    };
  } catch (error) {
    console.error("Error fetching landing data:", error);
    return {
      settings: {},
      features: [],
      roles: [],
      announcements: [],
      faqs: [],
      howItWorks: [],
    };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
});
