"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

export default function AcademicYearForm() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const isEdit = params.id !== "new";

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchYear = async () => {
        try {
          const res = await fetch(`/api/academic-years/${params.id}`);
          const data = await res.json();
          if (data.success) {
            setFormData({
              name: data.data.name,
              startDate: data.data.startDate.split("T")[0],
              endDate: data.data.endDate.split("T")[0],
              isActive: data.data.isActive,
            });
          } else {
            error("Error", "Data tidak ditemukan");
            router.push("/admin/academic-years");
          }
        } catch (err) {
          error("Error", "Gagal memuat data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchYear();
    }
  }, [isEdit, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit
        ? `/api/academic-years/${params.id}`
        : "/api/academic-years";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", `Tahun ajaran berhasil ${isEdit ? "diupdate" : "ditambahkan"}`);
        router.push("/admin/academic-years");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Memuat...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Tahun Ajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tahun Ajaran</Label>
              <Input
                id="name"
                placeholder="Contoh: 2025/2026 Genap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Status Aktif</Label>
                <p className="text-sm text-muted-foreground">Aktifkan tahun ajaran ini (akan menonaktifkan yang lain)</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
