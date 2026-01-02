import Link from "next/link";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import {
  ClipboardCheck,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Shield,
  Zap,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  FileText,
  Users,
  CheckCircle,
  GraduationCap,
  Shield,
  Zap,
};

// Default settings for fallback
const defaultSettings = {
  heroTitle: "Selamat Datang di ATTENDLY",
  heroSubtitle: "Smart Attendance System untuk Sekolah Modern",
  heroImage: null,
  aboutTitle: "Tentang ATTENDLY",
  aboutDescription: "Sistem absensi terintegrasi untuk memudahkan pengelolaan kehadiran siswa dan guru.",
  feature1Title: "Absensi Digital",
  feature1Desc: "Rekam kehadiran secara digital dengan mudah dan akurat",
  feature1Icon: "ClipboardCheck",
  feature2Title: "Laporan Real-time",
  feature2Desc: "Pantau statistik kehadiran secara real-time",
  feature2Icon: "FileText",
  feature3Title: "Multi-Role",
  feature3Desc: "Akses berbeda untuk Admin, Guru, dan Siswa",
  feature3Icon: "Users",
  contactEmail: "info@attendly.id",
  contactPhone: "0511-1234567",
  contactAddress: "Jl. Pendidikan No. 1",
  footerText: "© 2026 ATTENDLY. All rights reserved.",
  primaryColor: "#2563eb",
};

async function getLandingSettings() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("DATABASE_URL not set, using defaults");
      return defaultSettings;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    let settings = await prisma.landingPageSettings.findFirst();

    if (!settings) {
      settings = await prisma.landingPageSettings.create({
        data: {},
      });
    }

    await prisma.$disconnect();
    await pool.end();

    return settings;
  } catch (error) {
    console.error("Error fetching landing settings:", error);
    return defaultSettings;
  }
}

export default async function LandingPage() {
  const settings = await getLandingSettings();

  const features = [
    {
      title: settings.feature1Title,
      description: settings.feature1Desc,
      icon: iconMap[settings.feature1Icon] || ClipboardCheck,
    },
    {
      title: settings.feature2Title,
      description: settings.feature2Desc,
      icon: iconMap[settings.feature2Icon] || FileText,
    },
    {
      title: settings.feature3Title,
      description: settings.feature3Desc,
      icon: iconMap[settings.feature3Icon] || Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-bold text-xl">ATTENDLY</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              Fitur
            </a>
            <a href="#about" className="text-sm hover:text-primary transition-colors">
              Tentang
            </a>
            <a href="#contact" className="text-sm hover:text-primary transition-colors">
              Kontak
            </a>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Masuk
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32" suppressHydrationWarning>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4" />
              Smart Attendance System
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {settings.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105"
              >
                Mulai Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 border border-input px-8 py-4 rounded-xl font-semibold hover:bg-accent transition-colors"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1000+", label: "Siswa Aktif" },
              { value: "50+", label: "Guru Terdaftar" },
              { value: "36", label: "Kelas" },
              { value: "95%", label: "Tingkat Kehadiran" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground">
              Kelola absensi dengan mudah menggunakan fitur-fitur canggih kami
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 bg-muted/30" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {settings.aboutTitle}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {settings.aboutDescription}
              </p>
              <ul className="space-y-4">
                {[
                  "Rekam absensi digital dengan cepat dan akurat",
                  "Pantau kehadiran real-time dari dashboard",
                  "Generate laporan otomatis bulanan",
                  "Kelola izin dan cuti dengan mudah",
                  "Notifikasi otomatis untuk orang tua",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border">
                <div className="text-center">
                  <GraduationCap className="h-20 w-20 text-primary mx-auto mb-4" />
                  <p className="text-xl font-semibold">ATTENDLY</p>
                  <p className="text-sm text-muted-foreground">Smart Attendance System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hubungi Kami
            </h2>
            <p className="text-muted-foreground">
              Punya pertanyaan? Jangan ragu untuk menghubungi kami
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {settings.contactPhone && (
              <div className="text-center p-6 rounded-xl border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">Telepon</h3>
                <p className="text-muted-foreground">{settings.contactPhone}</p>
              </div>
            )}
            {settings.contactEmail && (
              <div className="text-center p-6 rounded-xl border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">{settings.contactEmail}</p>
              </div>
            )}
            {settings.contactAddress && (
              <div className="text-center p-6 rounded-xl border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">Alamat</h3>
                <p className="text-muted-foreground">{settings.contactAddress}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">A</span>
              </div>
              <span className="font-bold">ATTENDLY</span>
            </div>
            <p className="text-sm text-muted-foreground">{settings.footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
