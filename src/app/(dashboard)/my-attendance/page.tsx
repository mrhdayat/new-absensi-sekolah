"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  CheckCircle,
  LogIn,
  LogOut,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatTime, formatShortDate } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "PRESENT" | "LATE" | "SICK" | "PERMITTED" | "ABSENT";
  notes: string | null;
}

interface TodayStatus {
  data: AttendanceRecord | null;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
}

const statusBadgeMap = {
  PRESENT: { variant: "present" as const, label: "Hadir" },
  LATE: { variant: "late" as const, label: "Terlambat" },
  SICK: { variant: "sick" as const, label: "Sakit" },
  PERMITTED: { variant: "permitted" as const, label: "Izin" },
  ABSENT: { variant: "absent" as const, label: "Alpha" },
};

export default function MyAttendancePage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [todayStatus, setTodayStatus] = React.useState<TodayStatus | null>(null);
  const [history, setHistory] = React.useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

  // Fetch today's status
  const fetchTodayStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/teacher/today");
      const data = await res.json();
      if (data.success) {
        setTodayStatus(data);
      }
    } catch (err) {
      console.error("Error fetching today status:", err);
    }
  }, []);

  // Fetch history
  const fetchHistory = React.useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch("/api/attendance/teacher/history?limit=10");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTodayStatus();
    fetchHistory();
  }, [fetchTodayStatus, fetchHistory]);

  // Handle check-in/out
  const handleAttendance = async (action: "check-in" | "check-out") => {
    setIsLoading(true);
    try {
      // Get location if available
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch {
          console.log("Location not available");
        }
      }

      const res = await fetch("/api/attendance/teacher/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, latitude, longitude }),
      });

      const data = await res.json();

      if (data.success) {
        success(
          action === "check-in" ? "Absen Masuk Berhasil" : "Absen Pulang Berhasil",
          data.message
        );
        fetchTodayStatus();
        fetchHistory();
      } else {
        error("Gagal", data.error || "Terjadi kesalahan");
      }
    } catch (err) {
      error("Error", "Gagal memproses absensi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Absensi Saya</h1>
        <p className="text-muted-foreground">
          Kelola absensi kehadiran harian Anda
        </p>
      </div>

      {/* Today's Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Status Hari Ini
              </CardTitle>
              <CardDescription>{formatDate(new Date())}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                {todayStatus?.isCheckedIn ? (
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {todayStatus?.isCheckedIn
                      ? todayStatus.isCheckedOut
                        ? "Selesai"
                        : "Sudah Absen Masuk"
                      : "Belum Absen"}
                  </p>
                  {todayStatus?.data && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {todayStatus.data.checkIn && (
                        <span className="flex items-center gap-1">
                          <LogIn className="h-3 w-3" />
                          Masuk: {formatTime(todayStatus.data.checkIn)}
                        </span>
                      )}
                      {todayStatus.data.checkOut && (
                        <span className="flex items-center gap-1">
                          <LogOut className="h-3 w-3" />
                          Pulang: {formatTime(todayStatus.data.checkOut)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {todayStatus?.data?.status && (
                  <Badge
                    variant={statusBadgeMap[todayStatus.data.status].variant}
                    className="ml-auto"
                  >
                    {statusBadgeMap[todayStatus.data.status].label}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!todayStatus?.isCheckedIn && (
                  <Button
                    onClick={() => handleAttendance("check-in")}
                    isLoading={isLoading}
                    className="flex-1"
                    size="lg"
                    variant="success"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Absen Masuk
                  </Button>
                )}
                {todayStatus?.isCheckedIn && !todayStatus.isCheckedOut && (
                  <Button
                    onClick={() => handleAttendance("check-out")}
                    isLoading={isLoading}
                    className="flex-1"
                    size="lg"
                    variant="outline"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Absen Pulang
                  </Button>
                )}
                {todayStatus?.isCheckedOut && (
                  <div className="flex-1 text-center py-3 text-muted-foreground">
                    ✅ Absensi hari ini sudah lengkap
                  </div>
                )}
              </div>

              {/* Current Time */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Waktu server: {formatTime(new Date())}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Statistik Bulan Ini</CardTitle>
              <CardDescription>Ringkasan kehadiran Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                  <p className="text-3xl font-bold text-emerald-500">22</p>
                  <p className="text-sm text-muted-foreground">Hadir</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-500/10">
                  <p className="text-3xl font-bold text-amber-500">2</p>
                  <p className="text-sm text-muted-foreground">Terlambat</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <p className="text-3xl font-bold text-blue-500">1</p>
                  <p className="text-sm text-muted-foreground">Izin</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10">
                  <p className="text-3xl font-bold text-red-500">0</p>
                  <p className="text-sm text-muted-foreground">Alpha</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
          <CardDescription>10 absensi terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada riwayat absensi
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{formatShortDate(record.date)}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      {record.checkIn && (
                        <span>Masuk: {formatTime(record.checkIn)}</span>
                      )}
                      {record.checkOut && (
                        <span>Pulang: {formatTime(record.checkOut)}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={statusBadgeMap[record.status].variant}>
                    {statusBadgeMap[record.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
