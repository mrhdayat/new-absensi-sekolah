"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatTime } from "@/lib/utils";

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [conflictError, setConflictError] = React.useState("");
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [schedule, setSchedule] = React.useState<any>(null);
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
        const [scheduleRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
          fetch(`/api/schedules/${params.id}`, { cache: "no-store" }),
          fetch("/api/classes"),
          fetch("/api/subjects"),
          fetch("/api/teachers?limit=100"),
        ]);

        const scheduleData = await scheduleRes.json();
        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        const teachersData = await teachersRes.json();

        if (scheduleData.success) {
          const sched = scheduleData.data;
          setSchedule(sched);
          setFormData({
            classId: sched.classId,
            subjectId: sched.subjectId,
            teacherId: sched.teacherId,
            dayOfWeek: sched.dayOfWeek,
            startTime: formatTime(sched.startTime),
            endTime: formatTime(sched.endTime),
            room: sched.room || "",
          });
        }

        if (classesData.success) setClasses(classesData.data);
        if (subjectsData.success) setSubjects(subjectsData.data);
        if (teachersData.success) setTeachers(teachersData.data);
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
    setConflictError("");

    try {
      const res = await fetch(`/api/schedules/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Jadwal berhasil diupdate");
        router.push("/admin/schedules");
      } else {
        if (data.conflicts) {
          setConflictError(data.error);
        } else {
          error("Gagal", data.error || "Gagal mengupdate jadwal");
        }
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/schedules/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Jadwal berhasil dihapus");
        router.push("/admin/schedules");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus jadwal");
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

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Jadwal tidak ditemukan</p>
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
          Hapus Jadwal
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Jadwal</h1>
        <p className="text-muted-foreground">
          {schedule.class.name} - {schedule.subject.name}
        </p>
      </div>

      {schedule._count?.attendances > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Jadwal ini memiliki {schedule._count.attendances} catatan kehadiran. Perubahan waktu
            dapat mempengaruhi data yang ada.
          </AlertDescription>
        </Alert>
      )}

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
            <CardDescription>Update data jadwal pelajaran</CardDescription>
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
        title="Hapus Jadwal"
        description={
          schedule._count?.attendances > 0
            ? `Jadwal ini memiliki ${schedule._count.attendances} catatan kehadiran dan tidak dapat dihapus.`
            : "Apakah Anda yakin ingin menghapus jadwal ini?"
        }
        type={schedule._count?.attendances > 0 ? "warning" : "danger"}
        confirmText="Hapus"
        onConfirm={handleDelete}
      />
    </div>
  );
}
