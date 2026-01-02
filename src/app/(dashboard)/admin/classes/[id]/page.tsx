"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

interface Teacher {
  id: string;
  user: {
    name: string;
  };
}

interface ClassData {
  id: string;
  name: string;
  grade: string;
  capacity: number;
  homeroomTeacherId: string | null;
  students: any[];
  schedules: any[];
}

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [classData, setClassData] = React.useState<ClassData | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    grade: "",
    homeroomTeacherId: "",
    capacity: 30,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, teachersRes] = await Promise.all([
          fetch(`/api/classes/${params.id}`),
          fetch("/api/teachers?limit=100"),
        ]);

        const classData = await classRes.json();
        const teachersData = await teachersRes.json();

        if (classData.success) {
          setClassData(classData.data);
          setFormData({
            name: classData.data.name,
            grade: classData.data.grade,
            homeroomTeacherId: classData.data.homeroomTeacherId || "",
            capacity: classData.data.capacity,
          });
        }

        if (teachersData.success) {
          setTeachers(teachersData.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
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
      const res = await fetch(`/api/classes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          homeroomTeacherId: formData.homeroomTeacherId || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Kelas berhasil diupdate");
        router.push("/admin/classes");
      } else {
        error("Gagal", data.error || "Gagal mengupdate kelas");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
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

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Kelas tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Kelas</h1>
        <p className="text-muted-foreground">Update informasi kelas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classData.students.length}</p>
                <p className="text-sm text-muted-foreground">Total Siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classData.schedules.length}</p>
                <p className="text-sm text-muted-foreground">Jadwal Pelajaran</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kelas</CardTitle>
            <CardDescription>Update data kelas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kelas *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Tingkat *</Label>
                <select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas Siswa *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                />
                {classData.students.length > formData.capacity && (
                  <p className="text-xs text-red-500">
                    Peringatan: Kapasitas lebih kecil dari jumlah siswa saat ini
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeroomTeacherId">Wali Kelas</Label>
                <select
                  id="homeroomTeacherId"
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Pilih Wali Kelas (Opsional)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
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

      {/* Students List */}
      {classData.students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
            <CardDescription>{classData.students.length} siswa di kelas ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classData.students.slice(0, 10).map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{student.user.name}</p>
                    <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>
                  </div>
                  <Badge variant="outline">{student.status}</Badge>
                </div>
              ))}
              {classData.students.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Dan {classData.students.length - 10} siswa lainnya
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
