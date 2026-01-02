"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const leaveSchema = z.object({
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal akhir wajib diisi"),
  type: z.enum(["SICK", "FAMILY", "OTHER"]),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
  attachment: z.string().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface TeacherLeave {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  approvedBy?: {
    name: string;
  };
}

export default function TeacherLeavesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error } = useToast();
  const [leaves, setLeaves] = React.useState<TeacherLeave[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const fetchLeaves = React.useCallback(async () => {
    try {
      const res = await fetch("/api/leave-requests/teacher");
      const data = await res.json();
      if (data.success) {
        setLeaves(data.data);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const onSubmit = async (data: LeaveFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leave-requests/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        success("Berhasil", "Pengajuan izin berhasil dikirim");
        setIsOpen(false);
        reset();
        fetchLeaves();
      } else {
        error("Gagal", result.error);
      }
    } catch (err) {
      error("Error", "Gagal mengirim pengajuan izin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const approvedLeaves = leaves.filter((l) => l.status === "APPROVED");
  const rejectedLeaves = leaves.filter((l) => l.status === "REJECTED");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengajuan Izin</h1>
          <p className="text-muted-foreground">
            Kelola pengajuan izin Anda
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajukan Izin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajukan Izin Baru</DialogTitle>
              <DialogDescription>
                Isi form di bawah untuk mengajukan izin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-500">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Akhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Jenis Izin</Label>
                <select
                  id="type"
                  {...register("type")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="SICK">Sakit</option>
                  <option value="FAMILY">Urusan Keluarga</option>
                  <option value="OTHER">Lainnya</option>
                </select>
                {errors.type && (
                  <p className="text-xs text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Alasan</Label>
                <Textarea
                  id="reason"
                  placeholder="Jelaskan alasan izin Anda..."
                  rows={4}
                  {...register("reason")}
                />
                {errors.reason && (
                  <p className="text-xs text-red-500">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Kirim Pengajuan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">{pendingLeaves.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold">{approvedLeaves.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold">{rejectedLeaves.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaves List */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada pengajuan izin</p>
              <Button className="mt-4" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajukan Izin Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          leaves.map((leave) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {leave.type === "SICK" ? "Sakit" : leave.type === "FAMILY" ? "Urusan Keluarga" : "Lainnya"}
                      </CardTitle>
                      <CardDescription>
                        {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                        {new Date(leave.endDate).toLocaleDateString("id-ID")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        leave.status === "PENDING"
                          ? "warning"
                          : leave.status === "APPROVED"
                            ? "success"
                            : "destructive"
                      }
                    >
                      {leave.status === "PENDING"
                        ? "Menunggu"
                        : leave.status === "APPROVED"
                          ? "Disetujui"
                          : "Ditolak"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Alasan:</p>
                    <p className="text-sm text-muted-foreground">{leave.reason}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Diajukan: {new Date(leave.createdAt).toLocaleDateString("id-ID")}</span>
                    {leave.approvedBy && (
                      <span>Diproses oleh: {leave.approvedBy.name}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
