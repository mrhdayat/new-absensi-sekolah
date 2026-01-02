"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileQuestion,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    studentAttendanceRate: string;
    teacherAttendanceRate: string;
  };
  todayAttendance: {
    students: Record<string, number>;
    teachers: Record<string, number>;
  };
  pendingApprovals: {
    teacherLeaves: number;
  };
  alerts: {
    lowAttendanceStudents: Array<{
      id: string;
      name: string;
      className: string;
      attendanceRate: string;
      totalDays: number;
      presentDays: number;
    }>;
  };
  performance: {
    teachers: Array<{
      id: string;
      name: string;
      attendanceRate: string;
      punctualityRate: string;
      totalDays: number;
      presentDays: number;
      onTimeDays: number;
    }>;
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-emerald-500 bg-emerald-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    danger: "text-red-500 bg-red-500/10",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PrincipalDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/principal");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {greeting()}, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard
            title="Total Siswa"
            value={stats.overview.totalStudents}
            icon={GraduationCap}
            color="primary"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Total Guru"
            value={stats.overview.totalTeachers}
            icon={Users}
            color="success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Total Kelas"
            value={stats.overview.totalClasses}
            icon={School}
            color="warning"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Kehadiran Siswa"
            value={`${stats.overview.studentAttendanceRate}%`}
            icon={TrendingUp}
            trend="Hari ini"
            color="success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="Kehadiran Guru"
            value={`${stats.overview.teacherAttendanceRate}%`}
            icon={Activity}
            trend="Hari ini"
            color="success"
          />
        </motion.div>
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals.teacherLeaves > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileQuestion className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  {stats.pendingApprovals.teacherLeaves} Pengajuan Izin Guru Menunggu Persetujuan
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Klik untuk meninjau dan menyetujui pengajuan izin guru
                </p>
              </div>
              <a
                href="/principal/teacher-leaves"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                Tinjau Sekarang
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Absensi Siswa Hari Ini
            </CardTitle>
            <CardDescription>Breakdown kehadiran siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">Hadir</span>
                </div>
                <Badge variant="present">{stats.todayAttendance.students.PRESENT || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Terlambat</span>
                </div>
                <Badge variant="late">{stats.todayAttendance.students.LATE || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Sakit</span>
                </div>
                <Badge variant="sick">{stats.todayAttendance.students.SICK || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Izin</span>
                </div>
                <Badge variant="permitted">{stats.todayAttendance.students.PERMITTED || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Alpha</span>
                </div>
                <Badge variant="absent">{stats.todayAttendance.students.ABSENT || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Absensi Guru Hari Ini
            </CardTitle>
            <CardDescription>Breakdown kehadiran guru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">Hadir</span>
                </div>
                <Badge variant="present">{stats.todayAttendance.teachers.PRESENT || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Terlambat</span>
                </div>
                <Badge variant="late">{stats.todayAttendance.teachers.LATE || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Sakit</span>
                </div>
                <Badge variant="sick">{stats.todayAttendance.teachers.SICK || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Izin</span>
                </div>
                <Badge variant="permitted">{stats.todayAttendance.teachers.PERMITTED || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Alpha</span>
                </div>
                <Badge variant="absent">{stats.todayAttendance.teachers.ABSENT || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Alert */}
      {stats.alerts.lowAttendanceStudents.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="h-5 w-5" />
              Siswa dengan Kehadiran Rendah (&lt; 80%)
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {stats.alerts.lowAttendanceStudents.length} siswa memiliki tingkat kehadiran di bawah 80% dalam 30 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.lowAttendanceStudents.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border">
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.className} • {student.presentDays}/{student.totalDays} hari hadir
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{student.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Kehadiran</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teacher Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Kinerja Guru (30 Hari Terakhir)
          </CardTitle>
          <CardDescription>Tingkat kehadiran dan ketepatan waktu guru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.performance.teachers.slice(0, 10).map((teacher) => (
              <div key={teacher.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.presentDays}/{teacher.totalDays} hari hadir • {teacher.onTimeDays} tepat waktu
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{teacher.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Kehadiran</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Kehadiran</span>
                      <span className="font-medium">{teacher.attendanceRate}%</span>
                    </div>
                    <Progress value={parseFloat(teacher.attendanceRate)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Ketepatan</span>
                      <span className="font-medium">{teacher.punctualityRate}%</span>
                    </div>
                    <Progress value={parseFloat(teacher.punctualityRate)} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
