"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { School, Plus, Search, Edit, Trash2, Users, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface Class {
  id: string;
  name: string;
  grade: string;
  capacity: number;
  homeroomTeacher: {
    user: {
      name: string;
    };
  } | null;
  academicYear: {
    name: string;
    isActive: boolean;
  };
  _count: {
    students: number;
    schedules: number;
  };
}

export default function ClassesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [gradeFilter, setGradeFilter] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchClasses = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(gradeFilter && { grade: gradeFilter }),
      });

      const res = await fetch(`/api/classes?${params}`);
      const data = await res.json();

      if (data.success) {
        setClasses(data.data);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, gradeFilter]);

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/classes/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Kelas berhasil dihapus");
        fetchClasses();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus kelas");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School className="h-6 w-6" />
            Manajemen Kelas
          </h1>
          <p className="text-muted-foreground">Kelola data kelas sekolah</p>
        </div>
        <Button onClick={() => router.push("/admin/classes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setGradeFilter("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">
            Tidak ada kelas ditemukan
          </div>
        ) : (
          classes.map((cls) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cls.academicYear.name}
                      </p>
                    </div>
                    <Badge variant={cls.academicYear.isActive ? "present" : "default"}>
                      {cls.academicYear.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {cls._count.students} / {cls.capacity} siswa
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{cls._count.schedules} jadwal</span>
                    </div>
                    {cls.homeroomTeacher && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Wali Kelas: </span>
                        <span className="font-medium">{cls.homeroomTeacher.user.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/classes/${cls.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(cls.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Kelas"
        description="Apakah Anda yakin ingin menghapus kelas ini? Pastikan tidak ada siswa di kelas ini."
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
