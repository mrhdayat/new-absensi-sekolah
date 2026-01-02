"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, TrendingUp, FileText, Clock, Award, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";

interface TeacherDetail {
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
    sickDays: number;
    permittedDays: number;
    absentDays: number;
    attendanceRate: number;
    punctualityRate: number;
    pendingLeaves: number;
  };
  recentAttendances: Array<{
    id: string;
    date: Date;
    status: string;
    checkIn: Date | null;
    checkOut: Date | null;
  }>;
}

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = React.useState<TeacherDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/analytics/teachers?teacherId=${params.id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching teacher detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

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

  const getPerformanceLevel = (rate: number) => {
    if (rate >= 95) return { label: "Excellent", color: "text-emerald-600" };
    if (rate >= 85) return { label: "Good", color: "text-blue-600" };
    if (rate >= 75) return { label: "Average", color: "text-amber-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Guru tidak ditemukan</p>
        <Button onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  const performanceLevel = getPerformanceLevel(data.stats?.attendanceRate || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Detail Guru</h1>
          <p className="text-muted-foreground">Informasi lengkap dan riwayat kehadiran</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={data.user.avatar || undefined} />
              <AvatarFallback className="text-3xl">
                {getInitials(data.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{data.user.name}</h2>
                  <p className="text-muted-foreground">{data.user.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">NIP: {data.nip}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Status Hari Ini</p>
                  {getStatusBadge(data.todayStatus)}
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
                  <p className="font-medium">{data.subject || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance Level</p>
                  <p className={`font-medium ${performanceLevel.color}`}>
                    {performanceLevel.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tingkat Kehadiran</p>
                <p className="text-2xl font-bold">{data.stats.attendanceRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
            <Progress value={data.stats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ketepatan Waktu</p>
                <p className="text-2xl font-bold">{data.stats.punctualityRate}%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={data.stats.punctualityRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hadir</p>
                <p className="text-2xl font-bold">{data.stats.presentDays}</p>
                <p className="text-xs text-muted-foreground">dari {data.stats.totalDays} hari</p>
              </div>
              <Award className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Izin Pending</p>
                <p className="text-2xl font-bold">{data.stats.pendingLeaves}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Kehadiran (30 Hari)</CardTitle>
            <CardDescription>Detail status kehadiran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm">Hadir Tepat Waktu</span>
              </div>
              <span className="font-bold">{data.stats.onTimeDays} hari</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Terlambat</span>
              </div>
              <span className="font-bold">{data.stats.lateDays} hari</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Sakit</span>
              </div>
              <span className="font-bold">{data.stats.sickDays} hari</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Izin</span>
              </div>
              <span className="font-bold">{data.stats.permittedDays} hari</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Alpha</span>
              </div>
              <span className="font-bold">{data.stats.absentDays} hari</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Riwayat Kehadiran Terbaru
            </CardTitle>
            <CardDescription>7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentAttendances.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada data kehadiran
              </p>
            ) : (
              data.recentAttendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(attendance.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {attendance.checkIn && (
                      <p className="text-xs text-muted-foreground">
                        Masuk: {new Date(attendance.checkIn).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(attendance.status)}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
