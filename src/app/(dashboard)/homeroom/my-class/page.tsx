"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Phone,
  Mail,
  Eye,
  Key,
  Copy,
  Check,
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Student {
  id: string;
  name: string;
  nis: string;
  attendance: {
    present: number;
    sick: number;
    permission: number;
    alpha: number;
    total: number;
    percentage: number;
  };
  lastAttendance?: {
    status: string;
    date: Date;
    time: string;
  };
}

interface ClassData {
  id: string;
  name: string;
  grade: string;
  major: string;
  academicYear: string;
  totalStudents: number;
  averageAttendance: number;
  students: Student[];
  lowAttendanceStudents: Student[];
}

export default function MyClassPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [data, setData] = React.useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "low">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Reset Code State
  const [isResetOpen, setIsResetOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/homeroom/my-class");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          error("Gagal", json.error || "Gagal memuat data kelas");
        }
      } catch (err) {
        error("Error", "Terjadi kesalahan jaringan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [error]);

  const handleGenerateCode = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/homeroom/reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent.id })
      });
      const result = await res.json();
      if (result.success) {
        setGeneratedCode(result.code);
        success("Kode Berhasil Dibuat", `Kode reset password untuk ${selectedStudent.name} berlaku 15 menit.`);
      } else {
        error("Gagal", result.error);
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan sistem");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success("Tersalin", "Kode disalin ke clipboard");
    }
  };

  const closeResetModal = () => {
    setIsResetOpen(false);
    setGeneratedCode(null);
    setSelectedStudent(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-full bg-slate-100 mb-4">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Tidak Ada Data Kelas</h3>
        <p className="text-slate-500 max-w-sm mt-2">
          Anda belum ditetapkan sebagai wali kelas untuk tahun ajaran aktif ini. Hubungi admin kurikulum untuk informasi lebih lanjut.
        </p>
      </div>
    );
  }

  const filteredStudents = (filter === "low" ? data.lowAttendanceStudents : data.students)
    .filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nis.includes(searchQuery)
    );

  return (
    <div className="space-y-8 pb-10">
      {/* Header Info Kelas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 group flex items-center gap-2">
            {data.grade} {data.major} {data.name}
            <Badge variant="outline" className="text-sm font-normal text-slate-500">
              {data.academicYear}
            </Badge>
          </h1>
          <p className="text-slate-500">
            Kelola data siswa, absensi, dan akademik kelas Anda.
          </p>
        </div>
        <Button variant="outline" className="hidden md:flex" disabled>
          <Calendar className="mr-2 h-4 w-4" />
          Download Laporan
        </Button>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white hover:shadow-md transition-all border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Siswa aktif dalam kelas</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-all border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Rata-rata Kehadiran</CardTitle>
            <div className={`
              h-2 w-2 rounded-full
              ${data.averageAttendance >= 90 ? 'bg-emerald-500' :
                data.averageAttendance >= 75 ? 'bg-yellow-500' : 'bg-rose-500'}
            `} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.averageAttendance}%</div>
            <Progress
              value={data.averageAttendance}
              className={`mt-2 h-1.5 [&>div]:${data.averageAttendance >= 90 ? 'bg-emerald-500' : data.averageAttendance >= 75 ? 'bg-yellow-500' : 'bg-rose-500'}`}
            />
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-all border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Perhatian Khusus</CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {data.lowAttendanceStudents.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Siswa dengan kehadiran &lt; 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Siswa */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Semua Siswa
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${filter === "low"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Perlu Perhatian
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama atau NIS..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-all border-slate-200 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                        <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{student.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{student.nis}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi Siswa</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/homeroom/students/${student.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Detail Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/homeroom/attendance/student/${student.id}`)}>
                          <Calendar className="mr-2 h-4 w-4" /> Riwayat Absensi
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsResetOpen(true);
                          }}
                          className="text-amber-600 focus:text-amber-700"
                        >
                          <Key className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Kehadiran</p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-bold ${student.attendance.percentage >= 90 ? 'text-emerald-600' :
                            student.attendance.percentage >= 80 ? 'text-yellow-600' : 'text-rose-600'
                          }`}>
                          {student.attendance.percentage}%
                        </span>
                        <span className="text-xs text-slate-400">/ bulan ini</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status Hari Ini</p>
                      {student.lastAttendance ? (
                        <Badge variant={
                          student.lastAttendance.status === 'HADIR' ? 'default' :
                            student.lastAttendance.status === 'SAKIT' ? 'secondary' : 'destructive'
                        } className="font-normal">
                          {student.lastAttendance.status}
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-500">Tidak ada siswa yang ditemukan dengan filter ini.</p>
          </div>
        )}
      </div>

      {/* Reset Code Modal */}
      <Dialog open={isResetOpen} onOpenChange={(open) => !open && closeResetModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password Siswa (Delegasi)</DialogTitle>
            <DialogDescription>
              Peringatan: Verifikasi identitas siswa sebelum memberikan kode ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedStudent && !generatedCode && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Siswa:</p>
                  <p className="text-lg font-bold">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.nis}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Klik tombol di bawah untuk membuat Kode OTP 6-Digit sementara.
                  Kode ini hanya berlaku 15 menit.
                </p>
                <Button onClick={handleGenerateCode} disabled={isGenerating} className="w-full">
                  {isGenerating ? "Memproses..." : "Generate Kode Reset"}
                </Button>
              </div>
            )}

            {generatedCode && selectedStudent && (
              <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Kode Reset Password</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-4xl font-mono font-bold tracking-[0.5em] text-primary">
                      {generatedCode}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800 flex items-start text-left gap-2">
                  <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>Instruksikan siswa untuk membuka halaman Login, pilih "Siswa Lupa Password", dan masukkan Kode ini beserta Password Baru mereka.</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Disalin" : "Salin Kode"}
                  </Button>
                  <Button className="flex-1" onClick={closeResetModal}>
                    Selesai
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
