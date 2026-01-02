import Link from "next/link";
import { AttendanceCheckForm } from "@/components/public/AttendanceCheckForm";
import {
  Phone,
  Mail,
  MapPin,
  Twitter,
  Instagram,
  Facebook,
  ShieldCheck,
  Users,
  Award
} from "lucide-react";
import { SpotlightBackground } from "@/components/landing/SpotlightBackground";
import { getLandingData } from "@/lib/landing-cms";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RoleCards } from "@/components/landing/RoleCards";
import { Announcements } from "@/components/landing/Announcements";
import { FAQSection } from "@/components/landing/FAQSection";
import { CallToAction } from "@/components/landing/CallToAction";

export default async function LandingPage() {
  const { settings, features, roles, announcements, faqs, howItWorks, stats } = await getLandingData();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-500/30 dark">
      {/* Spotlight Background (Mouse Tracking) */}
      <SpotlightBackground />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg">A</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">ATTENDLY</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#features" className="text-sm hover:text-blue-500 transition-colors">Fitur</a>
            <a href="#how-it-works" className="text-sm hover:text-blue-500 transition-colors">Cara Kerja</a>
            <a href="#faq" className="text-sm hover:text-blue-500 transition-colors">FAQ</a>
            <a href="#contact" className="text-sm hover:text-blue-500 transition-colors">Kontak</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95 text-sm"
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <HeroSection settings={settings} />

      {/* 2. Attendance Check (Floating) */}
      <section id="check-attendance" className="relative z-20 mt-10 px-4 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-background/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-12 ring-1 ring-white/20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                Pencarian Siswa Cepat
              </h2>
              <p className="text-muted-foreground text-lg">
                Cek status kehadiran tanpa perlu login
              </p>
            </div>
            <AttendanceCheckForm />
          </div>
        </div>
      </section>

      {/* 2.5 About System (2-Column Narrative) */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left: Narrative */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Philosophy</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                {settings.aboutTitle || "Beyond Traditional Attendance"}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {settings.aboutDescription || "Kita membangun lebih dari sekadar alat absensi. Ini adalah ekosistem digital yang menghubungkan siswa, guru, dan orang tua dalam satu frekuensi transparansi dan efisiensi."}
              </p>

              <div className="flex flex-col gap-4 border-l-2 border-white/5 pl-6">
                <div>
                  <h4 className="text-white font-medium mb-1">Aman & Terenkripsi</h4>
                  <p className="text-sm text-muted-foreground">Data siswa dilindungi dengan standar keamanan industri.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Real-Time Sync</h4>
                  <p className="text-sm text-muted-foreground">Setiap detik berharga. Data diperbarui secara instan.</p>
                </div>
              </div>
            </div>

            {/* Right: Abstract Visual */}
            <div className="relative h-[400px] w-full rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2.6 Real-Time Stats */}
      <section className="py-20 border-y border-white/5 relative z-10 bg-white/[0.01]">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stats?.students || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Siswa Aktif</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stats?.teachers || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Guru Pengajar</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stats?.classes || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Kelas Terdaftar</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Uptime Sistem</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights (Dynamic) */}
      <FeatureGrid features={features} />

      {/* 4. How It Works (Dynamic) */}
      <HowItWorks steps={howItWorks} />

      {/* 5. User Roles (Dynamic) */}
      <RoleCards roles={roles} />

      {/* 6. Announcements (Dynamic - if any) */}
      <Announcements announcements={announcements} />

      {/* 7. Stats Mockup (If needed, can be dynamic later) */}

      {/* 8. FAQ (Dynamic) */}
      <FAQSection faqs={faqs} />

      {/* 9. Final CTA */}
      <CallToAction />

      {/* 10. Footer */}
      <footer id="contact" className="py-16 border-t border-white/10 relative z-10 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="font-bold text-white text-sm">A</span>
                </div>
                <span className="font-bold text-xl">ATTENDLY</span>
              </div>
              <p className="text-muted-foreground max-w-sm mb-6">
                Sistem informasi manajemen sekolah modern yang mengutamakan efisiensi, transparansi, dan kemudahan akses bagi seluruh civitas akademika.
              </p>
              <div className="flex gap-4 text-muted-foreground">
                <Twitter className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
                <Instagram className="h-5 w-5 hover:text-pink-500 cursor-pointer transition-colors" />
                <Facebook className="h-5 w-5 hover:text-blue-600 cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Hubungi Kami</h3>
              <ul className="space-y-4">
                {settings.contactPhone && (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{settings.contactPhone}</span>
                  </li>
                )}
                {settings.contactEmail && (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{settings.contactEmail}</span>
                  </li>
                )}
                {settings.contactAddress && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-1" />
                    <span>{settings.contactAddress}</span>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Tautan Cepat</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fitur</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Cara Kerja</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Login Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>{settings.footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
