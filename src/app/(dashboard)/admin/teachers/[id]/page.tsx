"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nip: "",
    name: "",
    email: "",
    gender: "MALE",
    phone: "",
    specialization: "",
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/teachers/${params.id}`);
        const data = await res.json();

        if (data.success) {
          const teacher = data.data;
          setFormData({
            nip: teacher.nip,
            name: teacher.user.name,
            email: teacher.user.email,
            gender: teacher.gender,
            phone: teacher.phone || "",
            specialization: teacher.specialization || "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        error("Error", "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/teachers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Data guru berhasil diupdate");
        router.push("/admin/teachers");
      } else {
        error("Gagal", data.error || "Gagal mengupdate data guru");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/teachers/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Guru berhasil dihapus");
        router.push("/admin/teachers");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus guru");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus Guru
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Data Guru</h1>
        <p className="text-muted-foreground">Update informasi guru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Guru</CardTitle>
            <CardDescription>Edit data guru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP *</Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specialization">Spesialisasi</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Hapus Guru"
        description="Apakah Anda yakin ingin menghapus guru ini? Data jadwal dan riwayat terkait akan terpengaruh."
        type="danger"
        confirmText="Hapus"
        onConfirm={handleDelete}
      />
    </div>
  );
}
