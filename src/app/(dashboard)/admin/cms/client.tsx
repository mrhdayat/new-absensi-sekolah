"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-modal";
import { Save, LayoutTemplate, List, Users, HelpCircle, Bell, GitMerge } from "lucide-react";
import {
  updateLandingSettings,
  createFeature, deleteFeature,
  createRole, deleteRole,
  createHowItWorks, deleteHowItWorks,
  createAnnouncement, deleteAnnouncement,
  createFAQ, deleteFAQ
} from "@/actions/landing-actions";
import { LandingData } from "@/lib/landing-cms";

interface AdminCMSClientProps {
  initialData: LandingData;
}

export function AdminCMSClient({ initialData }: AdminCMSClientProps) {
  const { success, error } = useToast();
  const [settings, setSettings] = useState(initialData.settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateLandingSettings(settings);
      if (result.success) {
        success("Berhasil", "Pengaturan umum berhasil disimpan.");
      } else {
        error("Gagal", result.error || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan sistem.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general" className="gap-2"><LayoutTemplate className="h-4 w-4" /> Umum</TabsTrigger>
        <TabsTrigger value="features" className="gap-2"><List className="h-4 w-4" /> Fitur</TabsTrigger>
        <TabsTrigger value="roles" className="gap-2"><Users className="h-4 w-4" /> Peran</TabsTrigger>
        <TabsTrigger value="how-it-works" className="gap-2"><GitMerge className="h-4 w-4" /> Cara Kerja</TabsTrigger>
        <TabsTrigger value="announcements" className="gap-2"><Bell className="h-4 w-4" /> Pengumuman</TabsTrigger>
        <TabsTrigger value="faq" className="gap-2"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
      </TabsList>

      {/* --- GENERAL SETTINGS --- */}
      <TabsContent value="general">
        <form onSubmit={handleSettingsSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum Landing Page</CardTitle>
              <CardDescription>Ubah teks utama, judul, dan informasi kontak.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={settings.heroTitle || ""}
                    onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    className="h-10 py-2"
                    value={settings.heroSubtitle || ""}
                    onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>About Title</Label>
                  <Input
                    value={settings.aboutTitle || ""}
                    onChange={e => setSettings({ ...settings, aboutTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>About Description</Label>
                  <Textarea
                    value={settings.aboutDescription || ""}
                    onChange={e => setSettings({ ...settings, aboutDescription: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    value={settings.contactEmail || ""}
                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.contactPhone || ""}
                    onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Address</Label>
                  <Input
                    value={settings.contactAddress || ""}
                    onChange={e => setSettings({ ...settings, contactAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Footer Text</Label>
                <Input
                  value={settings.footerText || ""}
                  onChange={e => setSettings({ ...settings, footerText: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="features">
        <CMSList
          title="Fitur Unggulan"
          description="Kelola daftar fitur yang tampil di halaman depan."
          items={initialData.features}
          onDelete={async (id) => deleteFeature(id)}
          onCreate={async (data) => createFeature(data)}
          fields={[
            { name: "title", label: "Judul", type: "text" },
            { name: "description", label: "Deskripsi", type: "textarea" },
            { name: "icon", label: "Icon (Lucide Name)", type: "text" },
          ]}
        />
      </TabsContent>

      <TabsContent value="roles">
        <CMSList
          title="Peran Pengguna"
          description="Informasi peran (Guru, Siswa, Admin, dll)."
          items={initialData.roles}
          onDelete={async (id) => deleteRole(id)}
          onCreate={async (data) => {
            // Basic role creation defaults
            return createRole({ ...data, roleCode: "CUSTOM", benefits: [] });
          }}
          fields={[
            { name: "title", label: "Judul Peran", type: "text" },
            { name: "description", label: "Deskripsi", type: "textarea" },
            { name: "icon", label: "Icon", type: "text" },
          ]}
        />
      </TabsContent>

      <TabsContent value="how-it-works">
        <CMSList
          title="Cara Kerja"
          description="Langkah-langkah penggunaan sistem."
          items={initialData.howItWorks}
          onDelete={async (id) => deleteHowItWorks(id)}
          onCreate={async (data) => createHowItWorks({ ...data, stepNumber: 1 })}
          fields={[
            { name: "title", label: "Judul Langkah", type: "text" },
            { name: "description", label: "Deskripsi", type: "textarea" },
            { name: "icon", label: "Icon", type: "text" },
          ]}
        />
      </TabsContent>

      <TabsContent value="announcements">
        <CMSList
          title="Pengumuman"
          description="Berita atau informasi penting."
          items={initialData.announcements}
          onDelete={async (id) => deleteAnnouncement(id)}
          onCreate={async (data) => createAnnouncement({ ...data, type: "INFO" })}
          fields={[
            { name: "title", label: "Judul", type: "text" },
            { name: "content", label: "Isi Pengumuman", type: "textarea" },
          ]}
        />
      </TabsContent>

      <TabsContent value="faq">
        <CMSList
          title="FAQ"
          description="Pertanyaan yang sering diajukan."
          items={initialData.faqs}
          onDelete={async (id) => deleteFAQ(id)}
          onCreate={async (data) => createFAQ(data)}
          fields={[
            { name: "question", label: "Pertanyaan", type: "text" },
            { name: "answer", label: "Jawaban", type: "textarea" },
          ]}
        />
      </TabsContent>

    </Tabs>
  );
}

// --- GENERIC LIST COMPONENT ---
interface CMSListProps {
  title: string;
  description: string;
  items: any[];
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  onCreate: (data: any) => Promise<{ success: boolean; error?: string }>;
  fields: { name: string; label: string; type: "text" | "textarea" }[];
}

function CMSList({ title, description, items, onDelete, onCreate, fields }: CMSListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { success: showSuccess, error: showError } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await onCreate(formData);
      if (res.success) {
        showSuccess("Berhasil", "Data berhasil ditambahkan");
        setIsOpen(false);
        setFormData({});
      } else {
        showError("Gagal", res.error || "Gagal menambah data");
      }
    } catch (err) {
      showError("Error", "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Data?",
      description: "Data yang dihapus tidak dapat dikembalikan.",
      type: "danger",
      confirmText: "Ya, Hapus",
      cancelText: "Batal"
    });

    if (!isConfirmed) return;

    try {
      const res = await onDelete(id);
      if (res.success) {
        showSuccess("Berhasil", "Data berhasil dihapus");
      } else {
        showError("Gagal", res.error || "Gagal menghapus data");
      }
    } catch (err) {
      showError("Error", "Terjadi kesalahan sistem");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm">
          {isOpen ? "Batal" : "Tambah Baru"}
        </Button>
      </CardHeader>
      <CardContent>
        {isOpen && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-accent/20 space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    required
                    value={formData[field.name] || ""}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                ) : (
                  <Input
                    required
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </form>
        )}

        <div className="space-y-4">
          {items.length === 0 && <p className="text-muted-foreground text-sm">Belum ada data.</p>}
          {items.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg bg-card">
              <div>
                <h4 className="font-semibold">{item.title || item.question || item.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description || item.answer || item.content}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>
        <ConfirmDialog />
      </CardContent>
    </Card>
  )
}
