"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  action: string;
  module: string;
  recordId: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-500",
  UPDATE: "bg-blue-500/10 text-blue-500",
  DELETE: "bg-red-500/10 text-red-500",
};

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [moduleFilter, setModuleFilter] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("");

  const fetchLogs = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(moduleFilter && { module: moduleFilter }),
        ...(actionFilter && { action: actionFilter }),
      });

      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, moduleFilter, actionFilter]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Audit Log
        </h1>
        <p className="text-muted-foreground">Riwayat aktivitas sistem</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Module</option>
              <option value="USER">User</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="CLASS">Class</option>
              <option value="SCHEDULE">Schedule</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="SETTINGS">Settings</option>
              <option value="LANDING_PAGE">Landing Page</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Semua Action</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setModuleFilter("");
                setActionFilter("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {logs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Tidak ada log ditemukan
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={actionColors[log.action] || "bg-muted"}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">{log.module}</Badge>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{log.user?.name || "System"}</span>
                        <span className="text-muted-foreground"> ({log.user?.email || "-"})</span>
                      </p>
                      {log.recordId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Record ID: {log.recordId}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleDateString("id-ID")}
                      </div>
                      <div className="text-xs">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
