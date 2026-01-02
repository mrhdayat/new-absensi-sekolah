"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  Palette,
  Type,
  Image,
  Layout,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface LandingSettings {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  aboutTitle: string;
  aboutDescription: string;
  feature1Title: string;
  feature1Desc: string;
  feature1Icon: string;
  feature2Title: string;
  feature2Desc: string;
  feature2Icon: string;
  feature3Title: string;
  feature3Desc: string;
  feature3Icon: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  footerText: string;
  primaryColor: string;
}

const iconOptions = [
  "ClipboardCheck",
  "FileText",
  "Users",
  "CheckCircle",
  "GraduationCap",
  "Shield",
  "Zap",
];

export default function LandingCMSPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [settings, setSettings] = React.useState<LandingSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/landing");
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle input change
  const handleChange = (field: keyof LandingSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  // Save settings
  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Pengaturan landing page berhasil disimpan");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Gagal memuat pengaturan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landing Page CMS</h1>
          <p className="text-muted-foreground">
            Kelola konten halaman depan website
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Preview
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Hero Section
            </CardTitle>
            <CardDescription>
              Bagian utama yang pertama kali dilihat pengunjung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Judul Hero</Label>
                <Input
                  id="heroTitle"
                  value={settings.heroTitle}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                  placeholder="Selamat Datang di ATTENDLY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Subtitle Hero</Label>
                <Input
                  id="heroSubtitle"
                  value={settings.heroSubtitle}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                  placeholder="Smart Attendance System..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroImage">URL Gambar Hero (opsional)</Label>
              <Input
                id="heroImage"
                value={settings.heroImage || ""}
                onChange={(e) => handleChange("heroImage", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              About Section
            </CardTitle>
            <CardDescription>
              Penjelasan tentang ATTENDLY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aboutTitle">Judul About</Label>
              <Input
                id="aboutTitle"
                value={settings.aboutTitle}
                onChange={(e) => handleChange("aboutTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutDescription">Deskripsi About</Label>
              <textarea
                id="aboutDescription"
                value={settings.aboutDescription}
                onChange={(e) => handleChange("aboutDescription", e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Features Section
            </CardTitle>
            <CardDescription>
              Tiga fitur unggulan yang ditampilkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature 1 */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Fitur 1</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Judul</Label>
                  <Input
                    value={settings.feature1Title}
                    onChange={(e) => handleChange("feature1Title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input
                    value={settings.feature1Desc}
                    onChange={(e) => handleChange("feature1Desc", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    value={settings.feature1Icon}
                    onChange={(e) => handleChange("feature1Icon", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Fitur 2</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Judul</Label>
                  <Input
                    value={settings.feature2Title}
                    onChange={(e) => handleChange("feature2Title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input
                    value={settings.feature2Desc}
                    onChange={(e) => handleChange("feature2Desc", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    value={settings.feature2Icon}
                    onChange={(e) => handleChange("feature2Icon", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Fitur 3</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Judul</Label>
                  <Input
                    value={settings.feature3Title}
                    onChange={(e) => handleChange("feature3Title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input
                    value={settings.feature3Desc}
                    onChange={(e) => handleChange("feature3Desc", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    value={settings.feature3Icon}
                    onChange={(e) => handleChange("feature3Icon", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Section
            </CardTitle>
            <CardDescription>
              Informasi kontak yang ditampilkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Telepon
                </Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone || ""}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="0511-1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail || ""}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="info@sekolah.sch.id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactAddress">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Alamat
                </Label>
                <Input
                  id="contactAddress"
                  value={settings.contactAddress || ""}
                  onChange={(e) => handleChange("contactAddress", e.target.value)}
                  placeholder="Jl. Pendidikan No. 1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer & Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Footer & Theme
            </CardTitle>
            <CardDescription>
              Pengaturan footer dan warna tema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="footerText">Teks Footer</Label>
                <Input
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) => handleChange("footerText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Warna Primer</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button (sticky) */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving} size="lg" className="shadow-lg">
          <Save className="h-4 w-4 mr-2" />
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
