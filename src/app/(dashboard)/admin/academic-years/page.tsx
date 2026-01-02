"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count?: { classes: number };
}

export default function AcademicYearsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/academic-years");
      const data = await res.json();
      if (data.success) {
        setYears(data.data);
      } else {
        error("Error", data.error);
      }
    } catch (err) {
      error("Error", "Gagal memuat data tahun ajaran");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (currentStatus) return; // Cannot deactivate the only active one directly (must activate another) - or maybe allow?
    // Let's allow activating.

    try {
      const res = await fetch(`/api/academic-years/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }), // Only sending isActive: true
      });

      const data = await res.json();
      if (data.success) {
        success("Berhasil", "Status tahun ajaran diperbarui");
        fetchYears(); // Refresh to show others deactivated
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal memperbarui status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/academic-years/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Tahun ajaran dihapus");
        fetchYears();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menghapus tahun ajaran");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tahun Ajaran</h1>
          <p className="text-muted-foreground">Kelola tahun ajaran sekolah</p>
        </div>
        <Button onClick={() => router.push("/admin/academic-years/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tahun Ajaran
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {years.map((year) => (
          <Card key={year.id} className={year.isActive ? "border-primary ring-1 ring-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                {year.name}
              </CardTitle>
              {year.isActive && (
                <Badge variant="default" className="bg-primary">
                  <Check className="h-3 w-3 mr-1" /> Aktif
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(year.startDate), "d MMM yyyy", { locale: idLocale })} - {format(new Date(year.endDate), "d MMM yyyy", { locale: idLocale })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status Aktif</span>
                    <Switch
                      checked={year.isActive}
                      onCheckedChange={() => handleToggleActive(year.id, year.isActive)}
                      disabled={year.isActive} // Disable unchecking directly if we enforce one active. 
                    // Actually better to only allow checking (activating) which creates switch.
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/academic-years/${year.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!year.isActive && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(year.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {years.length === 0 && (
          <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
            Belum ada data tahun ajaran.
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Tahun Ajaran"
        description="Apakah Anda yakin ingin menghapus tahun ajaran ini? Data tidak dapat dikembalikan."
        type="danger"
        confirmText="Hapus"
        onConfirm={handleDelete}
      />
    </div>
  );
}
