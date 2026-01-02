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

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState({
    nis: "",
    nisn: "",
    name: "",
    email: "",
    gender: "MALE",
    birthDate: "",
    parentPhone: "",
    classId: "",
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classesRes] = await Promise.all([
          fetch(`/api/students/${params.id}`),
          fetch("/api/classes"),
        ]);

        const studentData = await studentRes.json();
        const classesData = await classesRes.json();

        if (studentData.success) {
          console.log("Student Data Fetched:", studentData.data);
          const student = studentData.data;
          setFormData({
            nis: student.nis,
            nisn: student.nisn || "",
            name: student.user.name,
            email: student.user.email,
            gender: student.gender,
            birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split("T")[0] : "",
            parentPhone: student.parentPhone || "",
            classId: student.classId || "",
          });
        } else {
          console.error("Student fetch failed:", studentData.error);
        }

        if (classesData.success) {
          setClasses(classesData.data);
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
      const res = await fetch(`/api/students/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Data siswa berhasil diupdate");
        router.push("/admin/students");
      } else {
        error("Gagal", data.error || "Gagal mengupdate data siswa");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/students/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Siswa berhasil dihapus");
        router.push("/admin/students");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus siswa");
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
          Hapus Siswa
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Data Siswa</h1>
        <p className="text-muted-foreground">Update informasi siswa</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
            <CardDescription>Edit data siswa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nis">NIS *</Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input
                  id="nisn"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">No. HP Orang Tua</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Kelas *</Label>
                <select
                  id="classId"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
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
        title="Hapus Siswa"
        description="Apakah Anda yakin ingin menghapus siswa ini? Data absensi dan riwayat terkait akan terpengaruh."
        type="danger"
        confirmText="Hapus"
        onConfirm={handleDelete}
      />
    </div>
  );
}
