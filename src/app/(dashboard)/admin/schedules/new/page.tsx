"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewSchedulePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [conflictError, setConflictError] = React.useState("");
  const [formData, setFormData] = React.useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    room: "",
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, subjectsRes, teachersRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/subjects"),
          fetch("/api/teachers?limit=100"),
        ]);

        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        const teachersData = await teachersRes.json();

        if (classesData.success) setClasses(classesData.data);
        if (subjectsData.success) setSubjects(subjectsData.data);
        if (teachersData.success) setTeachers(teachersData.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConflictError("");

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Jadwal berhasil ditambahkan");
        router.push("/admin/schedules");
      } else {
        if (data.conflicts) {
          setConflictError(data.error);
        } else {
          error("Gagal", data.error || "Gagal menambahkan jadwal");
        }
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
        <h1 className="text-2xl font-bold">Tambah Jadwal Baru</h1>
        <p className="text-muted-foreground">Buat jadwal pelajaran baru</p>
      </div>

      {conflictError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conflictError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Jadwal</CardTitle>
            <CardDescription>Lengkapi data jadwal pelajaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="subjectId">Mata Pelajaran *</Label>
                <select
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherId">Guru Pengajar *</Label>
                <select
                  id="teacherId"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih Guru</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Hari *</Label>
                <select
                  id="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="MONDAY">Senin</option>
                  <option value="TUESDAY">Selasa</option>
                  <option value="WEDNESDAY">Rabu</option>
                  <option value="THURSDAY">Kamis</option>
                  <option value="FRIDAY">Jumat</option>
                  <option value="SATURDAY">Sabtu</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Jam Mulai *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Jam Selesai *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  min={formData.startTime}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="room">Ruangan</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Contoh: Lab Komputer 1, Ruang 301"
                />
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
