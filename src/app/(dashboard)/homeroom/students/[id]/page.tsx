"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, Calendar, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface StudentDetail {
  student: {
    id: string;
    nis: string;
    nisn: string;
    name: string;
    email: string;
    gender: string;
    birthDate: string;
    parentPhone: string | null;
    address: string | null;
    status: string;
    class: {
      name: string;
      grade: string;
    };
  };
  stats: {
    attendanceRate: number;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    sickDays: number;
    permittedDays: number;
    absentDays: number;
    attendanceByStatus: Record<string, number>;
  };
  recentAttendances: any[];
  leaveRequests: any[];
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = React.useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/homeroom/students/${params.id}`);
        const result = await res.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Siswa tidak ditemukan</p>
      </div>
    );
  }

  const { student, stats } = data;
  const attendanceColor =
    stats.attendanceRate >= 80
      ? "text-emerald-500"
      : stats.attendanceRate >= 60
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <p className="text-muted-foreground">
          {student.class.name} - NIS: {student.nis}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">NIS</p>
              <p className="font-medium">{student.nis}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NISN</p>
              <p className="font-medium">{student.nisn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
              <p className="font-medium">
                {student.gender === "MALE" ? "Laki-laki" : "Perempuan"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
              <p className="font-medium">
                {new Date(student.birthDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {student.email && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <p className="font-medium text-sm">{student.email}</p>
              </div>
            )}
            {student.parentPhone && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telepon Orang Tua
                </p>
                <p className="font-medium">{student.parentPhone}</p>
              </div>
            )}
            {student.address && (
              <div>
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p className="font-medium text-sm">{student.address}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={student.status === "ACTIVE" ? "present" : "default"}>
                {student.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistik Kehadiran (30 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tingkat Kehadiran</span>
                <span className={`text-2xl font-bold ${attendanceColor}`}>
                  {stats.attendanceRate}%
                </span>
              </div>
              <Progress
                value={stats.attendanceRate}
                className="h-3"
                indicatorClassName={
                  stats.attendanceRate >= 80
                    ? "bg-emerald-500"
                    : stats.attendanceRate >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-emerald-500/5">
                <p className="text-2xl font-bold text-emerald-600">{stats.presentDays}</p>
                <p className="text-sm text-muted-foreground">Hadir</p>
              </div>
              <div className="p-4 rounded-lg border bg-amber-500/5">
                <p className="text-2xl font-bold text-amber-600">{stats.lateDays}</p>
                <p className="text-sm text-muted-foreground">Terlambat</p>
              </div>
              <div className="p-4 rounded-lg border bg-blue-500/5">
                <p className="text-2xl font-bold text-blue-600">{stats.sickDays}</p>
                <p className="text-sm text-muted-foreground">Sakit</p>
              </div>
              <div className="p-4 rounded-lg border bg-purple-500/5">
                <p className="text-2xl font-bold text-purple-600">{stats.permittedDays}</p>
                <p className="text-sm text-muted-foreground">Izin</p>
              </div>
              <div className="p-4 rounded-lg border bg-red-500/5">
                <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
                <p className="text-sm text-muted-foreground">Alpha</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-2xl font-bold">{stats.totalDays}</p>
                <p className="text-sm text-muted-foreground">Total Hari</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riwayat Kehadiran Terbaru
          </CardTitle>
          <CardDescription>10 catatan kehadiran terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentAttendances.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Belum ada data kehadiran
              </p>
            ) : (
              data.recentAttendances.map((attendance: any) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(attendance.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {attendance.schedule?.subject?.name || "N/A"}
                    </p>
                  </div>
                  <Badge variant={attendance.status.toLowerCase() as any}>
                    {attendance.status === "PRESENT"
                      ? "Hadir"
                      : attendance.status === "LATE"
                        ? "Terlambat"
                        : attendance.status === "SICK"
                          ? "Sakit"
                          : attendance.status === "PERMITTED"
                            ? "Izin"
                            : "Alpha"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      {data.leaveRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Riwayat Izin
            </CardTitle>
            <CardDescription>Pengajuan izin siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.leaveRequests.map((leave: any) => (
                <div
                  key={leave.id}
                  className="flex items-start justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{leave.type}</Badge>
                      <Badge
                        variant={
                          leave.status === "APPROVED"
                            ? "present"
                            : leave.status === "REJECTED"
                              ? "absent"
                              : "default"
                        }
                      >
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{leave.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                      {new Date(leave.endDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
