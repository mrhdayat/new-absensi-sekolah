"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users,
  Check,
  X,
  FileText,
  Clock,
  Save,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import { AttendanceStatus } from "@/generated/prisma";

interface Student {
  id: string;
  nis: string;
  name: string;
  avatar: string | null;
  gender: "MALE" | "FEMALE";
  attendance: {
    id: string;
    status: AttendanceStatus;
    notes: string | null;
  } | null;
}

interface Schedule {
  id: string;
  class: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room: string | null;
}

interface AttendanceData {
  schedule: Schedule;
  date: string;
  students: Student[];
  totalStudents: number;
  attendedCount: number;
}

const statusOptions = [
  { value: "PRESENT", label: "Hadir", icon: Check, color: "bg-emerald-500" },
  { value: "LATE", label: "Terlambat", icon: Clock, color: "bg-amber-500" },
  { value: "SICK", label: "Sakit", icon: FileText, color: "bg-blue-500" },
  { value: "PERMITTED", label: "Izin", icon: FileText, color: "bg-purple-500" },
  { value: "ABSENT", label: "Alpha", icon: X, color: "bg-red-500" },
] as const;

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = React.useState<string | null>(null);
  const [attendanceData, setAttendanceData] = React.useState<AttendanceData | null>(null);
  const [localAttendances, setLocalAttendances] = React.useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch today's schedules for current teacher
  React.useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/schedules?today=true");
        const data = await res.json();
        if (data.success) {
          setSchedules(data.data);
          if (data.data.length > 0) {
            setSelectedSchedule(data.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Fetch students when schedule is selected
  React.useEffect(() => {
    if (!selectedSchedule) return;

    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/attendance/student?scheduleId=${selectedSchedule}`);
        const data = await res.json();
        if (data.success) {
          setAttendanceData(data.data);
          // Initialize local state with existing attendances
          const initial: Record<string, AttendanceStatus> = {};
          data.data.students.forEach((s: Student) => {
            if (s.attendance) {
              initial[s.id] = s.attendance.status;
            }
          });
          setLocalAttendances(initial);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSchedule]);

  // Update local attendance
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendances((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Mark all present
  const markAllPresent = () => {
    if (!attendanceData) return;
    const newAttendances: Record<string, AttendanceStatus> = {};
    attendanceData.students.forEach((s) => {
      newAttendances[s.id] = AttendanceStatus.PRESENT;
    });
    setLocalAttendances(newAttendances);
  };

  // Save attendance
  const saveAttendance = async () => {
    if (!selectedSchedule || !attendanceData) return;

    const attendances = Object.entries(localAttendances).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (attendances.length === 0) {
      error("Peringatan", "Belum ada siswa yang diabsen");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/attendance/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedSchedule,
          date: new Date().toISOString(),
          attendances,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", data.message);
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menyimpan absensi");
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(localAttendances).filter(
    (s) => s === "PRESENT" || s === "LATE"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Absensi Siswa</h1>
          <p className="text-muted-foreground">{formatDate(new Date())}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Semua Hadir
          </Button>
          <Button onClick={saveAttendance} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>

      {/* Schedule Selection */}
      {schedules.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {schedules.map((schedule) => (
            <Button
              key={schedule.id}
              variant={selectedSchedule === schedule.id ? "default" : "outline"}
              onClick={() => setSelectedSchedule(schedule.id)}
              className="whitespace-nowrap"
            >
              {schedule.class} - {schedule.subject}
            </Button>
          ))}
        </div>
      )}

      {/* Schedule Info */}
      {attendanceData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Kelas:</span>{" "}
                <span className="font-medium">{attendanceData.schedule.class}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mapel:</span>{" "}
                <span className="font-medium">{attendanceData.schedule.subject}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Waktu:</span>{" "}
                <span className="font-medium">
                  {formatTime(attendanceData.schedule.startTime)} -{" "}
                  {formatTime(attendanceData.schedule.endTime)}
                </span>
              </div>
              <div className="ml-auto">
                <Badge variant="success">
                  {presentCount}/{attendanceData.totalStudents} Hadir
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !attendanceData ? (
        <EmptyState
          title="Tidak ada jadwal"
          description="Anda tidak memiliki jadwal mengajar hari ini"
          variant="inbox"
        />
      ) : attendanceData.students.length === 0 ? (
        <EmptyState
          title="Tidak ada siswa"
          description="Belum ada siswa terdaftar di kelas ini"
          variant="inbox"
        />
      ) : (
        <div className="space-y-3">
          {attendanceData.students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar || undefined} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.nis}</p>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-1 flex-wrap justify-end">
                      {statusOptions.map((option) => {
                        const isSelected = localAttendances[student.id] === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setStudentStatus(student.id, option.value as AttendanceStatus)}
                            className={`
                              px-3 py-1.5 rounded-md text-xs font-medium transition-all
                              ${isSelected
                                ? `${option.color} text-white`
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
