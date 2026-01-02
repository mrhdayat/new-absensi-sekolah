"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Plus, Filter, Edit, Trash2, Clock, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { formatTime } from "@/lib/utils";

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  class: {
    name: string;
  };
  subject: {
    name: string;
    code: string;
  };
  teacher: {
    user: {
      name: string;
    };
  };
  _count?: {
    attendances: number;
  };
}

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const dayLabels: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
};

const subjectColors: string[] = [
  "bg-blue-500/10 text-blue-600 border-blue-200",
  "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "bg-purple-500/10 text-purple-600 border-purple-200",
  "bg-amber-500/10 text-amber-600 border-amber-200",
  "bg-pink-500/10 text-pink-600 border-pink-200",
  "bg-cyan-500/10 text-cyan-600 border-cyan-200",
];

export default function SchedulesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [classFilter, setClassFilter] = React.useState("");
  const [teacherFilter, setTeacherFilter] = React.useState("");
  const [classes, setClasses] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchSchedules = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(classFilter && { classId: classFilter }),
        ...(teacherFilter && { teacherId: teacherFilter }),
      });

      const res = await fetch(`/api/schedules?${params}`, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setIsLoading(false);
    }
  }, [classFilter, teacherFilter]);

  React.useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/teachers?limit=100"),
        ]);

        const classesData = await classesRes.json();
        const teachersData = await teachersRes.json();

        if (classesData.success) setClasses(classesData.data);
        if (teachersData.success) setTeachers(teachersData.data);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

  React.useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/schedules/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Jadwal berhasil dihapus");
        fetchSchedules();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus jadwal");
    } finally {
      setDeleteId(null);
    }
  };

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Sort each day's schedules by start time
  Object.keys(schedulesByDay).forEach((day) => {
    schedulesByDay[day].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });
  });

  // Get unique subjects for color mapping
  const uniqueSubjects = Array.from(new Set(schedules.map((s) => s.subject.code)));
  const subjectColorMap = uniqueSubjects.reduce((acc, code, index) => {
    acc[code] = subjectColors[index % subjectColors.length];
    return acc;
  }, {} as Record<string, string>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Manajemen Jadwal
          </h1>
          <p className="text-muted-foreground">
            Total {schedules.length} jadwal pelajaran
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/schedules/import")}>
            <Upload className="h-4 w-4 mr-2" />
            Import Jadwal
          </Button>
          <Button onClick={() => router.push("/admin/schedules/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Guru</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setClassFilter("");
                setTeacherFilter("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {days.map((day) => {
          const daySchedules = schedulesByDay[day] || [];

          return (
            <Card key={day} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{dayLabels[day]}</CardTitle>
                <CardDescription>{daySchedules.length} jadwal</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {daySchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada jadwal
                  </p>
                ) : (
                  daySchedules.map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3 rounded-lg border-2 ${subjectColorMap[schedule.subject.code]
                        } hover:shadow-md transition-shadow cursor-pointer group relative`}
                      onClick={() => router.push(`/admin/schedules/${schedule.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {schedule.subject.name}
                          </p>
                          <p className="text-xs opacity-75 truncate">
                            {schedule.class.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(schedule.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 text-xs mb-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate">{schedule.teacher.user.name}</span>
                        {schedule.room && (
                          <Badge variant="outline" className="text-xs">
                            {schedule.room}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Jadwal"
        description="Apakah Anda yakin ingin menghapus jadwal ini? Jadwal dengan catatan kehadiran tidak dapat dihapus."
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
