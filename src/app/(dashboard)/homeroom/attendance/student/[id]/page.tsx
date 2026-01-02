"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "LATE" | "SICK" | "PERMITTED" | "ABSENT";
  notes?: string;
  subject: string;
  time: string;
}

interface StudentData {
  student: {
    id: string;
    name: string;
    nis: string;
    className: string;
    avatar?: string;
  };
  stats: {
    total: number;
    present: number;
    sick: number;
    permission: number;
    alpha: number;
    late: number;
    percentage: number;
  };
  history: AttendanceRecord[];
}

export default function StudentAttendanceHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = React.useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/homeroom/attendance/student/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          console.error(json.error);
        }
      } catch (err) {
        console.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground">Data tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Hadir</Badge>;
      case "LATE": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Terlambat</Badge>;
      case "SICK": return <Badge variant="secondary">Sakit</Badge>;
      case "PERMITTED": return <Badge variant="outline" className="border-blue-500 text-blue-500">Izin</Badge>;
      case "ABSENT": return <Badge variant="destructive">Alpa</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${data.student.name}`} />
            <AvatarFallback>{data.student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.student.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{data.student.nis}</span>
              <span>•</span>
              <span>Kelas {data.student.className}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kehadiran</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.percentage}%</div>
            <p className="text-xs text-muted-foreground">Total {data.stats.present} hadir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sakit</CardTitle>
            <ActivityIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.sick}</div>
            <p className="text-xs text-muted-foreground">Hari</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Izin</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.permission}</div>
            <p className="text-xs text-muted-foreground">Hari</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tanpa Keterangan</CardTitle>
            <XCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{data.stats.alpha}</div>
            <p className="text-xs text-muted-foreground">Hari</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kehadiran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada data absensi
                  </TableCell>
                </TableRow>
              ) : (
                data.history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "EEEE, dd MMMM yyyy", { locale: idLocale })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{record.time}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {record.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
