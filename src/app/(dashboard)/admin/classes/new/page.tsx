"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface Teacher {
  id: string;
  user: {
    name: string;
  };
}

export default function NewClassPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [formData, setFormData] = React.useState({
    name: "",
    grade: "X",
    homeroomTeacherId: "",
    capacity: 30,
  });

  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/teachers?limit=100");
        const data = await res.json();
        if (data.success) {
          setTeachers(data.data);
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };

    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          homeroomTeacherId: formData.homeroomTeacherId || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Kelas berhasil ditambahkan");
        router.push("/admin/classes");
      } else {
        error("Gagal", data.error || "Gagal menambahkan kelas");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Tambah Kelas Baru</h1>
        <p className="text-muted-foreground">Buat kelas baru untuk tahun ajaran aktif</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kelas</CardTitle>
            <CardDescription>Lengkapi data kelas yang akan ditambahkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kelas *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="X TKJ 1, XI RPL 1, dll"
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
              <Button type="submit" isLoading={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
