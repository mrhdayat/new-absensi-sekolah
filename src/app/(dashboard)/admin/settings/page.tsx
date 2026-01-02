"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    attendanceStartTime: "",
    attendanceEndTime: "",
    gracePeriodMinutes: 0,
    lateThresholdMinutes: 0,
    enableLocationTracking: false,
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        if (data.success) {
          setFormData(data.data);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Pengaturan berhasil disimpan");
      } else {
        error("Gagal", data.error || "Gagal menyimpan pengaturan");
      }
    } catch (err) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Pengaturan Sistem
        </h1>
        <p className="text-muted-foreground">Kelola konfigurasi sistem sekolah</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Informasi Sekolah
            </CardTitle>
            <CardDescription>Data umum sekolah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nama Sekolah *</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Sekolah</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Absensi</CardTitle>
            <CardDescription>Konfigurasi waktu dan toleransi absensi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attendanceStartTime">Jam Mulai Absensi *</Label>
                <Input
                  id="attendanceStartTime"
                  type="time"
                  value={formData.attendanceStartTime}
                  onChange={(e) =>
                    setFormData({ ...formData, attendanceStartTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendanceEndTime">Jam Selesai Absensi *</Label>
                <Input
                  id="attendanceEndTime"
                  type="time"
                  value={formData.attendanceEndTime}
                  onChange={(e) =>
                    setFormData({ ...formData, attendanceEndTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gracePeriodMinutes">Grace Period (menit)</Label>
                <Input
                  id="gracePeriodMinutes"
                  type="number"
                  min="0"
                  value={formData.gracePeriodMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, gracePeriodMinutes: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Toleransi waktu sebelum dianggap terlambat
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateThresholdMinutes">Batas Terlambat (menit)</Label>
                <Input
                  id="lateThresholdMinutes"
                  type="number"
                  min="0"
                  value={formData.lateThresholdMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, lateThresholdMinutes: parseInt(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maksimal keterlambatan yang masih diterima
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableLocationTracking"
                    checked={formData.enableLocationTracking}
                    onChange={(e) =>
                      setFormData({ ...formData, enableLocationTracking: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="enableLocationTracking" className="cursor-pointer">
                    Aktifkan Pelacakan Lokasi
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Rekam lokasi saat absensi dilakukan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
