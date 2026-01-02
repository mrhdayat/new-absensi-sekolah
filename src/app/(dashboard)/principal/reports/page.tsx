"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";

interface ReportData {
  overview: {
    totalRecords: number;
    totalPresent: number;
    overallRate: number;
    trend: number;
  };
  dailyTrend: Array<{
    date: string;
    total: number;
    present: number;
    late: number;
    sick: number;
    permitted: number;
    absent: number;
    attendanceRate: number;
  }>;
  statusDistribution: {
    PRESENT: number;
    LATE: number;
    SICK: number;
    PERMITTED: number;
    ABSENT: number;
  };
  classSummary: Array<{
    className: string;
    total: number;
    present: number;
    attendanceRate: number;
  }>;
}

const STATUS_COLORS = {
  PRESENT: "#10b981",
  LATE: "#f59e0b",
  SICK: "#3b82f6",
  PERMITTED: "#8b5cf6",
  ABSENT: "#ef4444",
};

const STATUS_LABELS = {
  PRESENT: "Hadir",
  LATE: "Terlambat",
  SICK: "Sakit",
  PERMITTED: "Izin",
  ABSENT: "Alpha",
};

export default function ReportsPage() {
  const [data, setData] = React.useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [days, setDays] = React.useState(30);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [classFilter, setClassFilter] = React.useState("");

  const fetchReport = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        days: days.toString(),
        ...(classFilter && { classId: classFilter }),
      });

      const res = await fetch(`/api/reports/attendance?${params}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  }, [days, classFilter]);

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const result = await res.json();
        if (result.success) {
          setClasses(result.data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
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

  // Prepare pie chart data
  const pieData = Object.entries(data.statusDistribution).map(([key, value]) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
  }));

  // Format daily trend for chart
  const trendData = data.dailyTrend.map((day) => ({
    ...day,
    date: new Date(day.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Laporan & Analitik
          </h1>
          <p className="text-muted-foreground">Analisis kehadiran siswa</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                if (data) {
                  const className = classes.find((c) => c.id === classFilter)?.name;
                  exportToPDF(data, { days, className });
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (data) {
                  const className = classes.find((c) => c.id === classFilter)?.name;
                  exportToExcel(data, { days, className });
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="60">60 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setDays(30);
                setClassFilter("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.overview.totalRecords}</p>
                <p className="text-sm text-muted-foreground">Total Catatan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.overview.totalPresent}</p>
                <p className="text-sm text-muted-foreground">Total Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.overview.overallRate}%</p>
                <p className="text-sm text-muted-foreground">Tingkat Kehadiran</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${data.overview.trend >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
                  }`}
              >
                {data.overview.trend >= 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.overview.trend >= 0 ? "+" : ""}
                  {data.overview.trend}%
                </p>
                <p className="text-sm text-muted-foreground">Trend 7 Hari</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Kehadiran Harian</CardTitle>
          <CardDescription>Persentase kehadiran per hari</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="attendanceRate"
                stroke="#10b981"
                strokeWidth={2}
                name="Tingkat Kehadiran (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row 2: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran per Kelas</CardTitle>
            <CardDescription>Perbandingan tingkat kehadiran antar kelas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.classSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" fill="#3b82f6" name="Kehadiran (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Kehadiran</CardTitle>
            <CardDescription>Proporsi status kehadiran</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
