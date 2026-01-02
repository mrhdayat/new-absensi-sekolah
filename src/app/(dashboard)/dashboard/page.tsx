"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";
import { GamificationOverview } from "@/components/dashboard/GamificationOverview";
import { Leaderboard } from "@/components/dashboard/Leaderboard";

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceRate: string;
  };
  todayAttendance: {
    students: Record<string, number>;
    teachers: {
      total: number;
      present: number;
    };
  };
  [key: string]: any;
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            title="Tingkat Kehadiran"
            value={`${stats.overview.attendanceRate}%`}
            icon={TrendingUp}
            trend="Hari ini"
            color="success"
          />
        </motion.div>
      </div>

      {/* Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Absensi Siswa Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hadir</span>
                <Badge variant="present">{stats.todayAttendance.students.PRESENT || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Terlambat</span>
                <Badge variant="late">{stats.todayAttendance.students.LATE || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sakit</span>
                <Badge variant="sick">{stats.todayAttendance.students.SICK || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Izin</span>
                <Badge variant="permitted">{stats.todayAttendance.students.PERMITTED || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alpha</span>
                <Badge variant="absent">{stats.todayAttendance.students.ABSENT || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Absensi Guru Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-4xl font-bold text-emerald-500">
                  {stats.todayAttendance.teachers.present}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  dari {stats.todayAttendance.teachers.total} guru hadir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific sections */}
      {session?.user?.role === "HOMEROOM_TEACHER" && stats.homeroomClass && (
        <Card>
          <CardHeader>
            <CardTitle>Kelas Binaan Saya</CardTitle>
            <CardDescription>{stats.homeroomClass.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <p className="text-2xl font-bold">{stats.homeroomClass.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Siswa</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-2xl font-bold text-amber-500">
                  {stats.homeroomClass.lowAttendanceCount}
                </p>
                <p className="text-sm text-muted-foreground">Kehadiran &lt; 80%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(session?.user?.role === "TEACHER" || session?.user?.role === "HOMEROOM_TEACHER") && stats.todaySchedules && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jadwal Mengajar Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.todaySchedules.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Tidak ada jadwal mengajar hari ini
              </p>
            ) : (
              <div className="space-y-3">
                {stats.todaySchedules.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{schedule.className}</p>
                      <p className="text-sm text-muted-foreground">{schedule.subjectName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">{schedule.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {session?.user?.role === "STUDENT" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GamificationOverview />
            <Leaderboard />
          </div>

          {stats.myClass && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kehadiran Saya</CardTitle>
                  <CardDescription>30 hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-4xl font-bold text-primary">{stats.myAttendanceRate}%</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {stats.totalPresent} hadir, {stats.totalAbsent} tidak hadir
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kelas Saya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <School className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="text-xl font-bold">{stats.myClass}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN") && stats.recentActivities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} - {activity.module}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
