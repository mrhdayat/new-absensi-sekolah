"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Subject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  _count: {
    schedules: number;
  };
}

export default function SubjectsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editSubject, setEditSubject] = React.useState<Subject | null>(null);
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    description: "",
  });

  const fetchSubjects = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
      });

      const res = await fetch(`/api/subjects?${params}`);
      const data = await res.json();

      if (data.success) {
        setSubjects(data.data);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editSubject ? `/api/subjects/${editSubject.id}` : "/api/subjects";
      const method = editSubject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", editSubject ? "Mata pelajaran berhasil diupdate" : "Mata pelajaran berhasil ditambahkan");
        setIsCreateOpen(false);
        setEditSubject(null);
        setFormData({ code: "", name: "", description: "" });
        fetchSubjects();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/subjects/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Mata pelajaran berhasil dihapus");
        fetchSubjects();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus mata pelajaran");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
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
            <BookOpen className="h-6 w-6" />
            Manajemen Mata Pelajaran
          </h1>
          <p className="text-muted-foreground">Kelola data mata pelajaran</p>
        </div>
        <Button onClick={() => {
          setEditSubject(null);
          setFormData({ code: "", name: "", description: "" });
          setIsCreateOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode atau nama mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full text-center p-12 text-muted-foreground">
            Tidak ada mata pelajaran ditemukan
          </div>
        ) : (
          subjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="font-mono">
                      {subject.code}
                    </Badge>
                    <Badge>{subject._count.schedules} jadwal</Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{subject.name}</h3>
                  {subject.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(subject)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(subject.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editSubject ? "Edit" : "Tambah"} Mata Pelajaran</DialogTitle>
            <DialogDescription>
              {editSubject ? "Update" : "Tambahkan"} data mata pelajaran
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Mata Pelajaran *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="MAT, BIN, BIG, dll"
                required
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Mata Pelajaran *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Matematika, Bahasa Indonesia, dll"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi mata pelajaran (opsional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {editSubject ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Mata Pelajaran"
        description="Apakah Anda yakin ingin menghapus mata pelajaran ini? Pastikan tidak ada jadwal yang menggunakan mata pelajaran ini."
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
