"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardCheck, Save, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatTime } from "@/lib/utils";

interface Student {
  id: string;
  nis: string;
  user: {
    name: string;
  };
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  class: {
    id: string;
    name: string;
  };
  subject: {
    name: string;
  };
}

const statusOptions = [
  { value: "PRESENT", label: "Hadir", color: "present" },
  { value: "LATE", label: "Terlambat", color: "late" },
  { value: "SICK", label: "Sakit", color: "sick" },
  { value: "PERMITTED", label: "Izin", color: "permitted" },
  { value: "ABSENT", label: "Alpha", color: "absent" },
];

export default function MarkAttendancePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedSchedule, setSelectedSchedule] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [attendanceData, setAttendanceData] = React.useState<Record<string, string>>({});

  // Fetch teacher's schedules
  React.useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("/api/schedules?mySchedules=true");
        const data = await res.json();
        if (data.success) {
          setSchedules(data.data);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };

    fetchSchedules();
  }, []);

  // Fetch students when schedule is selected
  React.useEffect(() => {
    if (!selectedSchedule) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const schedule = schedules.find((s) => s.id === selectedSchedule);
        if (!schedule) return;

        const res = await fetch(`/api/students?classId=${schedule.class.id}&limit=100`);
        const data = await res.json();

        if (data.success) {
          setStudents(data.data);
          // Initialize all as PRESENT by default
          const initialData: Record<string, string> = {};
          data.data.forEach((student: Student) => {
            initialData[student.id] = "PRESENT";
          });
          setAttendanceData(initialData);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        error("Error", "Gagal memuat data siswa");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSchedule, schedules]);

  const handleBulkAction = (status: string) => {
    const newData: Record<string, string> = {};
    students.forEach((student) => {
      newData[student.id] = status;
    });
    setAttendanceData(newData);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSchedule) {
      error("Error", "Pilih jadwal terlebih dahulu");
      return;
    }

    setIsSaving(true);

    try {
      // Create batch payload
      const payload = {
        scheduleId: selectedSchedule,
        date: selectedDate,
        attendances: students.map(student => ({
          studentId: student.id,
          status: attendanceData[student.id],
        }))
      };

      const res = await fetch("/api/attendance/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const allSuccess = res.ok;
      const result = await res.json();

      if (!allSuccess) {
        throw new Error(result.error);
      }

      if (allSuccess) {
        success("Berhasil", `Absensi ${students.length} siswa berhasil disimpan`);
        // Reset
        setSelectedSchedule("");
        setStudents([]);
        setAttendanceData({});
      } else {
        error("Gagal", "Beberapa data gagal disimpan");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedScheduleData = schedules.find((s) => s.id === selectedSchedule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" />
          Tandai Kehadiran Siswa
        </h1>
        <p className="text-muted-foreground">Catat kehadiran siswa untuk jadwal mengajar Anda</p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Jadwal & Tanggal</CardTitle>
          <CardDescription>Pilih jadwal mengajar dan tanggal untuk menandai kehadiran</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jadwal Mengajar</label>
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Pilih Jadwal</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.class.name} - {schedule.subject.name} ({schedule.dayOfWeek},{" "}
                    {formatTime(schedule.startTime)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {selectedScheduleData && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Kelas</p>
                  <p className="font-medium">{selectedScheduleData.class.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mata Pelajaran</p>
                  <p className="font-medium">{selectedScheduleData.subject.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hari</p>
                  <p className="font-medium">{selectedScheduleData.dayOfWeek}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Waktu</p>
                  <p className="font-medium">
                    {formatTime(selectedScheduleData.startTime)} -{" "}
                    {formatTime(selectedScheduleData.endTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : students.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Siswa ({students.length})</CardTitle>
                <CardDescription>Tandai status kehadiran setiap siswa</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("PRESENT")}
                  className="text-emerald-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Semua Hadir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("ABSENT")}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Semua Alpha
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{student.user.name}</p>
                    <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>
                  </div>

                  <div className="flex gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(student.id, option.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${attendanceData[student.id] === option.value
                          ? `bg-${option.color} text-white`
                          : "bg-muted hover:bg-muted/80"
                          }`}
                        style={
                          attendanceData[student.id] === option.value
                            ? {
                              backgroundColor:
                                option.color === "present"
                                  ? "#10b981"
                                  : option.color === "late"
                                    ? "#f59e0b"
                                    : option.color === "sick"
                                      ? "#3b82f6"
                                      : option.color === "permitted"
                                        ? "#8b5cf6"
                                        : "#ef4444",
                              color: "white",
                            }
                            : undefined
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button onClick={handleSubmit} isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Simpan Kehadiran
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedSchedule ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Tidak ada siswa di kelas ini
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
