"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface StudentData {
  myClass: string;
  myAttendanceRate: string;
  totalPresent: number;
  totalAbsent: number;
  recentLeaves: any[];
}

export default function StudentAttendancePage() {
  const router = useRouter();
  const [data, setData] = React.useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const result = await res.json();

        if (result.success && result.data.myClass) {
          setData({
            myClass: result.data.myClass,
            myAttendanceRate: result.data.myAttendanceRate,
            totalPresent: result.data.totalPresent,
            totalAbsent: result.data.totalAbsent,
            recentLeaves: result.data.recentLeaves || [],
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Data tidak tersedia</p>
      </div>
    );
  }

  const attendanceRate = parseFloat(data.myAttendanceRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Kehadiran Saya
          </h1>
          <p className="text-muted-foreground">Kelas: {data.myClass}</p>
        </div>
        <Button onClick={() => router.push("/student/leaves/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Ajukan Izin
        </Button>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Kehadiran</CardTitle>
            <CardDescription>30 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p
                  className={`text-5xl font-bold ${attendanceRate >= 80
                      ? "text-emerald-500"
                      : attendanceRate >= 60
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                >
                  {data.myAttendanceRate}%
                </p>
              </div>

              <Progress
                value={attendanceRate}
                className="h-3"
                indicatorClassName={
                  attendanceRate >= 80
                    ? "bg-emerald-500"
                    : attendanceRate >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }
              />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 rounded-lg border bg-emerald-500/5">
                  <p className="text-3xl font-bold text-emerald-600">{data.totalPresent}</p>
                  <p className="text-sm text-muted-foreground">Hadir</p>
                </div>
                <div className="text-center p-4 rounded-lg border bg-red-500/5">
                  <p className="text-3xl font-bold text-red-600">{data.totalAbsent}</p>
                  <p className="text-sm text-muted-foreground">Tidak Hadir</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Riwayat Izin
            </CardTitle>
            <CardDescription>Pengajuan izin terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentLeaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada pengajuan izin
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentLeaves.map((leave: any) => (
                  <div key={leave.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
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
                    <p className="text-sm text-muted-foreground">
                      {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                      {new Date(leave.endDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push("/student/leaves")}
            >
              Lihat Semua Izin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
