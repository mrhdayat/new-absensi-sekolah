"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
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
    } | null;
  };
  approvedBy: {
    name: string;
  } | null;
}

export default function LeaveApprovalsPage() {
  const { success, error } = useToast();
  const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("PENDING");
  const [actionLeave, setActionLeave] = React.useState<{ id: string; action: string } | null>(
    null
  );

  const fetchLeaves = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        limit: "50",
      });

      const res = await fetch(`/api/leaves?${params}`);
      const data = await res.json();

      if (data.success) {
        setLeaves(data.data);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleAction = async () => {
    if (!actionLeave) return;

    try {
      const res = await fetch(`/api/leaves/${actionLeave.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionLeave.action === "approve" ? "APPROVED" : "REJECTED",
        }),
      });

      const data = await res.json();

      if (data.success) {
        success(
          "Berhasil",
          `Izin ${actionLeave.action === "approve" ? "disetujui" : "ditolak"}`
        );
        fetchLeaves();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setActionLeave(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Persetujuan Izin
        </h1>
        <p className="text-muted-foreground">
          Kelola pengajuan izin siswa ({pendingCount} pending)
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </Button>
            <Button
              variant={statusFilter === "APPROVED" ? "default" : "outline"}
              onClick={() => setStatusFilter("APPROVED")}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Disetujui
            </Button>
            <Button
              variant={statusFilter === "REJECTED" ? "default" : "outline"}
              onClick={() => setStatusFilter("REJECTED")}
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Ditolak
            </Button>
            <Button
              variant={statusFilter === "" ? "default" : "outline"}
              onClick={() => setStatusFilter("")}
              size="sm"
            >
              Semua
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <div className="space-y-3">
        {leaves.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Tidak ada pengajuan izin
            </CardContent>
          </Card>
        ) : (
          leaves.map((leave) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{leave.student.user.name}</h3>
                        <Badge variant="outline">
                          {leave.student.class?.name || "No Class"}
                        </Badge>
                        <Badge
                          variant={
                            leave.status === "APPROVED"
                              ? "present"
                              : leave.status === "REJECTED"
                                ? "absent"
                                : "default"
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm mb-3">
                        <p>
                          <span className="text-muted-foreground">Jenis: </span>
                          <span className="font-medium">{leave.type}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Periode: </span>
                          <span>
                            {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                            {new Date(leave.endDate).toLocaleDateString("id-ID")}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Alasan: </span>
                          <span>{leave.reason}</span>
                        </p>
                        {leave.approvedBy && (
                          <p className="text-xs text-muted-foreground">
                            Disetujui oleh: {leave.approvedBy.name}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Diajukan: {new Date(leave.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {leave.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:text-emerald-700"
                          onClick={() => setActionLeave({ id: leave.id, action: "approve" })}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setActionLeave({ id: leave.id, action: "reject" })}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!actionLeave}
        onOpenChange={(open) => !open && setActionLeave(null)}
        onConfirm={handleAction}
        title={actionLeave?.action === "approve" ? "Setujui Izin" : "Tolak Izin"}
        description={`Apakah Anda yakin ingin ${actionLeave?.action === "approve" ? "menyetujui" : "menolak"
          } pengajuan izin ini?`}
        confirmText={actionLeave?.action === "approve" ? "Setujui" : "Tolak"}
        type={actionLeave?.action === "approve" ? "question" : "danger"}
      />
    </div>
  );
}
