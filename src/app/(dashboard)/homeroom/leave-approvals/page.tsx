"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileQuestion, Check, X, Calendar, User, FileText, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface StudentLeave {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  student: {
    user: {
      name: string;
      email: string;
    };
    class: {
      name: string;
    };
  };
  approvedBy?: {
    name: string;
  };
}

export default function HomeroomLeaveApprovalsPage() {
  const { success, error } = useToast();
  const [leaves, setLeaves] = React.useState<StudentLeave[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedLeave, setSelectedLeave] = React.useState<string | null>(null);
  const [actionType, setActionType] = React.useState<"approve" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fetchLeaves = React.useCallback(async () => {
    try {
      const res = await fetch("/api/leave-requests/student");
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

  const handleAction = async () => {
    if (!selectedLeave || !actionType) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/leave-requests/student/${selectedLeave}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType === "approve" ? "APPROVED" : "REJECTED",
        }),
      });

      const data = await res.json();

      if (data.success) {
        success(
          actionType === "approve" ? "Disetujui" : "Ditolak",
          `Pengajuan izin berhasil ${actionType === "approve" ? "disetujui" : "ditolak"}`
        );
        fetchLeaves();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal memproses pengajuan izin");
    } finally {
      setIsProcessing(false);
      setSelectedLeave(null);
      setActionType(null);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const processedLeaves = leaves.filter((l) => l.status !== "PENDING");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileQuestion className="h-6 w-6" />
          Persetujuan Izin Siswa
        </h1>
        <p className="text-muted-foreground">
          Kelola pengajuan izin dari siswa kelas binaan Anda
        </p>
      </div>

      {/* Pending Leaves */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Menunggu Persetujuan ({pendingLeaves.length})
        </h2>
        {pendingLeaves.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tidak ada pengajuan izin yang menunggu</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingLeaves.map((leave) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {leave.student.user.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          {leave.student.class.name}
                        </CardDescription>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Tanggal</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                            {new Date(leave.endDate).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Jenis</p>
                          <p className="text-sm text-muted-foreground">
                            {leave.type === "SICK" ? "Sakit" : leave.type === "FAMILY" ? "Keluarga" : "Lainnya"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Diajukan</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(leave.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Alasan:</p>
                      <p className="text-sm text-muted-foreground bg-white dark:bg-gray-900 p-3 rounded-lg border">
                        {leave.reason}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedLeave(leave.id);
                          setActionType("approve");
                        }}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedLeave(leave.id);
                          setActionType("reject");
                        }}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Leaves */}
      {processedLeaves.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Riwayat ({processedLeaves.length})
          </h2>
          <div className="grid gap-4">
            {processedLeaves.map((leave) => (
              <Card key={leave.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {leave.student.user.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        {leave.student.class.name}
                      </CardDescription>
                    </div>
                    <Badge variant={leave.status === "APPROVED" ? "success" : "destructive"}>
                      {leave.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Tanggal</p>
                      <p className="text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                        {new Date(leave.endDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Jenis</p>
                      <p className="text-muted-foreground">
                        {leave.type === "SICK" ? "Sakit" : leave.type === "FAMILY" ? "Keluarga" : "Lainnya"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Diproses oleh</p>
                      <p className="text-muted-foreground">{leave.approvedBy?.name || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!selectedLeave && !!actionType}
        onOpenChange={(open) => !open && (setSelectedLeave(null), setActionType(null))}
        onConfirm={handleAction}
        title={actionType === "approve" ? "Setujui Pengajuan Izin" : "Tolak Pengajuan Izin"}
        description={
          actionType === "approve"
            ? "Apakah Anda yakin ingin menyetujui pengajuan izin siswa ini?"
            : "Apakah Anda yakin ingin menolak pengajuan izin siswa ini?"
        }
        confirmText={actionType === "approve" ? "Setujui" : "Tolak"}
        type={actionType === "reject" ? "danger" : undefined}
        isLoading={isProcessing}
      />
    </div>
  );
}
