"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Search, Edit, Trash2, Phone, MoreVertical, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  id: string;
  nis: string;
  nisn: string;
  gender: string;
  parentPhone: string | null;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    name: string;
  } | null;
}

export default function StudentsManagementPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("");
  const [genderFilter, setGenderFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [classes, setClasses] = React.useState<any[]>([]);

  const fetchStudents = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
        ...(classFilter && { classId: classFilter }),
        ...(genderFilter && { gender: genderFilter }),
      });

      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();

      if (data.success) {
        setStudents(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, classFilter, genderFilter]);

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        if (data.success) {
          setClasses(data.data);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/students/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Siswa berhasil dihapus");
        fetchStudents();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus siswa");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Manajemen Siswa
          </h1>
          <p className="text-muted-foreground">Kelola data siswa sekolah</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/students/import")}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => router.push("/admin/students/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
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
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Gender</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setClassFilter("");
                setGenderFilter("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">
            Tidak ada siswa ditemukan
          </div>
        ) : (
          students.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{student.user.name}</h3>
                      <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>
                      <p className="text-xs text-muted-foreground">NISN: {student.nisn}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/students/${student.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(student.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 mb-4">
                    {student.class && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Kelas: </span>
                        <span className="font-medium">{student.class.name}</span>
                      </div>
                    )}
                    {student.parentPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{student.parentPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge variant="outline">
                      {student.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                    </Badge>
                    <Badge
                      variant={
                        student.status === "ACTIVE"
                          ? "present"
                          : student.status === "GRADUATED"
                            ? "permitted"
                            : "absent"
                      }
                    >
                      {student.status === "ACTIVE"
                        ? "Aktif"
                        : student.status === "GRADUATED"
                          ? "Lulus"
                          : student.status === "TRANSFERRED"
                            ? "Pindah"
                            : "Nonaktif"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page - 2 + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Siswa"
        description="Apakah Anda yakin ingin menghapus siswa ini? Data absensi dan riwayat terkait akan terpengaruh."
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
}
