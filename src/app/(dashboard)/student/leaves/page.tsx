"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLeavesPage() {
  const router = useRouter();
  const [leaves, setLeaves] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch("/api/leaves");
        const data = await res.json();

        if (data.success) {
          setLeaves(data.data);
        }
      } catch (error) {
        console.error("Error fetching leaves:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Pengajuan Izin Saya
          </h1>
          <p className="text-muted-foreground">Riwayat pengajuan izin</p>
        </div>
        <Button onClick={() => router.push("/student/leaves/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Ajukan Izin Baru
        </Button>
      </div>

      {/* Leaves List */}
      {leaves.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Belum ada pengajuan izin
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{leave.type}</Badge>
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

                      <p className="font-medium mb-1">{leave.reason}</p>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Periode: {new Date(leave.startDate).toLocaleDateString("id-ID")} -{" "}
                          {new Date(leave.endDate).toLocaleDateString("id-ID")}
                        </p>
                        <p>Diajukan: {new Date(leave.createdAt).toLocaleString("id-ID")}</p>
                        {leave.approvedBy && (
                          <p>Disetujui oleh: {leave.approvedBy.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
