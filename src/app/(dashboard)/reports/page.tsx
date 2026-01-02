"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

// Stats Card Component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "primary",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
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
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${trend.isPositive ? "text-emerald-500" : "text-red-500"
                    }`}
                >
                  {trend.value}% dari bulan lalu
                </span>
              </div>
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

// Attendance Progress Bar
function AttendanceBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<"week" | "month" | "semester">("month");

  // Mock data - in real app, fetch from API
  const stats = {
    totalTeachers: 45,
    totalStudents: 1250,
    averageAttendance: 95.2,
    totalClasses: 36,
  };

  const attendanceBreakdown = {
    present: 1120,
    late: 63,
    sick: 32,
    permitted: 20,
    absent: 15,
    total: 1250,
  };

  const weeklyData = [
    { day: "Sen", present: 95, late: 3, absent: 2 },
    { day: "Sel", present: 94, late: 4, absent: 2 },
    { day: "Rab", present: 96, late: 2, absent: 2 },
    { day: "Kam", present: 93, late: 5, absent: 2 },
    { day: "Jum", present: 97, late: 2, absent: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Absensi</h1>
          <p className="text-muted-foreground">{formatDate(new Date())}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg p-1">
            {(["week", "month", "semester"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${selectedPeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                  }
                `}
              >
                {period === "week" ? "Minggu" : period === "month" ? "Bulan" : "Semester"}
              </button>
            ))}
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard
            title="Total Guru"
            value={stats.totalTeachers}
            description="Aktif mengajar"
            icon={Users}
            color="primary"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Total Siswa"
            value={stats.totalStudents}
            description="Terdaftar aktif"
            icon={GraduationCap}
            trend={{ value: 5.2, isPositive: true }}
            color="success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Rata-rata Kehadiran"
            value={`${stats.averageAttendance}%`}
            description="Bulan ini"
            icon={CheckCircle}
            trend={{ value: 2.1, isPositive: true }}
            color="success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Total Kelas"
            value={stats.totalClasses}
            description="Aktif"
            icon={Calendar}
            color="primary"
          />
        </motion.div>
      </div>

      {/* Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Kehadiran Siswa</CardTitle>
            <CardDescription>Distribusi status kehadiran bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AttendanceBar
              label="Hadir"
              value={attendanceBreakdown.present}
              total={attendanceBreakdown.total}
              color="bg-emerald-500"
            />
            <AttendanceBar
              label="Terlambat"
              value={attendanceBreakdown.late}
              total={attendanceBreakdown.total}
              color="bg-amber-500"
            />
            <AttendanceBar
              label="Sakit"
              value={attendanceBreakdown.sick}
              total={attendanceBreakdown.total}
              color="bg-blue-500"
            />
            <AttendanceBar
              label="Izin"
              value={attendanceBreakdown.permitted}
              total={attendanceBreakdown.total}
              color="bg-purple-500"
            />
            <AttendanceBar
              label="Alpha"
              value={attendanceBreakdown.absent}
              total={attendanceBreakdown.total}
              color="bg-red-500"
            />
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran Mingguan</CardTitle>
            <CardDescription>Persentase kehadiran per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-10 text-sm font-medium">{day.day}</span>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${day.present}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-emerald-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${day.late}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                      className="bg-amber-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${day.absent}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      className="bg-red-500"
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-emerald-500">
                    {day.present}%
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Hadir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span>Terlambat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Alpha</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Classes & Problem Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kelas Terbaik</CardTitle>
            <CardDescription>Kehadiran tertinggi bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "X TKJ 1", rate: 98.5 },
                { name: "XI RPL 2", rate: 97.8 },
                { name: "XII TKJ 1", rate: 97.2 },
                { name: "X RPL 1", rate: 96.9 },
                { name: "XI TKJ 2", rate: 96.5 },
              ].map((kelas, i) => (
                <div
                  key={kelas.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium">{kelas.name}</span>
                  </div>
                  <Badge variant="success">{kelas.rate}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perlu Perhatian</CardTitle>
            <CardDescription>Siswa dengan kehadiran rendah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Ahmad S.", class: "X TKJ 1", absent: 5 },
                { name: "Budi P.", class: "XI RPL 2", absent: 4 },
                { name: "Citra W.", class: "X RPL 1", absent: 4 },
                { name: "Deni R.", class: "XII TKJ 1", absent: 3 },
                { name: "Eka F.", class: "XI TKJ 2", absent: 3 },
              ].map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.class}</p>
                  </div>
                  <Badge variant="absent">{student.absent} Alpha</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
