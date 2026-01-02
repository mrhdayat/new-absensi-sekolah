"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, UserCheck, Clock, Heart, FileText, UserX, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";

interface TeacherData {
  id: string;
  nip: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  subject: string;
  todayStatus: string;
  stats: {
    totalDays: number;
    presentDays: number;
    onTimeDays: number;
    lateDays: number;
    attendanceRate: number;
    punctualityRate: number;
    pendingLeaves: number;
  };
}

interface AnalyticsData {
  overview: {
    totalTeachers: number;
    todayPresent: number;
    todayLate: number;
    todaySick: number;
    todayPermitted: number;
    todayAbsent: number;
    attendanceRate: number;
    punctualityRate: number;
  };
  todayAttendance: any[];
  teachers: TeacherData[];
  topPerformers: TeacherData[];
  lowPerformers: TeacherData[];
}

export default function TeacherMonitoringPage() {
  const router = useRouter();
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("ALL");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics/teachers?days=30");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching teacher analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PRESENT: { variant: "success", label: "Hadir" },
      LATE: { variant: "warning", label: "Telat" },
      SICK: { variant: "secondary", label: "Sakit" },
      PERMITTED: { variant: "default", label: "Izin" },
      ABSENT: { variant: "destructive", label: "Alpha" },
    };
    const config = variants[status] || variants.ABSENT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredTeachers = React.useMemo(() => {
    if (!data) return [];
    if (filter === "ALL") return data.teachers;
    return data.teachers.filter((t) => t.todayStatus === filter);
  }, [data, filter]);

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

  if (!data) {
    return <div className="text-center py-12">Failed to load data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Monitoring Keaktifan Guru
        </h1>
        <p className="text-muted-foreground">
          Pantau kehadiran dan kinerja guru secara real-time
        </p>
      </div>

      {/* Quick Stats - Today's Attendance */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("ALL")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Guru</p>
                <p className="text-2xl font-bold">{data.overview.totalTeachers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("PRESENT")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hadir</p>
                <p className="text-2xl font-bold text-emerald-600">{data.overview.todayPresent}</p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("LATE")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Telat</p>
                <p className="text-2xl font-bold text-amber-600">{data.overview.todayLate}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("SICK")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sakit</p>
                <p className="text-2xl font-bold text-blue-600">{data.overview.todaySick}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("PERMITTED")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Izin</p>
                <p className="text-2xl font-bold text-purple-600">{data.overview.todayPermitted}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("ABSENT")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alpha</p>
                <p className="text-2xl font-bold text-red-600">{data.overview.todayAbsent}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tingkat Kehadiran (30 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rata-rata</span>
                <span className="text-2xl font-bold">{data.overview.attendanceRate}%</span>
              </div>
              <Progress value={data.overview.attendanceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tingkat Ketepatan Waktu (30 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rata-rata</span>
                <span className="text-2xl font-bold">{data.overview.punctualityRate}%</span>
              </div>
              <Progress value={data.overview.punctualityRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top & Low Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Top Performers
            </CardTitle>
            <CardDescription>5 guru dengan kehadiran terbaik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topPerformers.slice(0, 5).map((teacher, index) => (
              <div key={teacher.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 text-xs font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={teacher.user.avatar || undefined} />
                  <AvatarFallback>{getInitials(teacher.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{teacher.user.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">{teacher.stats.attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Kehadiran</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Low Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Perlu Perhatian
            </CardTitle>
            <CardDescription>Guru dengan kehadiran &lt; 80%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lowPerformers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Semua guru memiliki kehadiran baik! 🎉
              </p>
            ) : (
              data.lowPerformers.slice(0, 5).map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={teacher.user.avatar || undefined} />
                    <AvatarFallback>{getInitials(teacher.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{teacher.user.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{teacher.stats.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Kehadiran</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Teacher List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Guru Hari Ini</CardTitle>
              <CardDescription>
                {filter === "ALL" ? "Semua guru" : `Filter: ${getStatusBadge(filter).props.children}`}
                {filter !== "ALL" && (
                  <button
                    onClick={() => setFilter("ALL")}
                    className="ml-2 text-xs text-primary hover:underline"
                  >
                    Reset filter
                  </button>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredTeachers.map((teacher) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/principal/teachers/${teacher.id}`)}
                className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={teacher.user.avatar || undefined} />
                  <AvatarFallback>{getInitials(teacher.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{teacher.user.name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                  <p className="text-xs text-muted-foreground">NIP: {teacher.nip}</p>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(teacher.todayStatus)}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Kehadiran: {teacher.stats.attendanceRate}%</span>
                    <span>•</span>
                    <span>Tepat Waktu: {teacher.stats.punctualityRate}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
