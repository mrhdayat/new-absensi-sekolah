"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Settings as SettingsIcon, Lock, Bell, Palette } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    attendanceReminders: true,
    leaveApprovals: true,
    systemUpdates: true,
  });

  // Fetch notification preferences
  React.useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch("/api/notifications/preferences");
        const data = await res.json();
        if (data.success) {
          setPreferences({
            emailNotifications: data.data.emailNotifications,
            pushNotifications: data.data.pushNotifications,
            inAppNotifications: data.data.inAppNotifications,
            attendanceReminders: data.data.attendanceReminders,
            leaveApprovals: data.data.leaveApprovals,
            systemUpdates: data.data.systemUpdates,
          });
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
      }
    };

    fetchPreferences();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("Error", "Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      error("Error", "Password baru minimal 6 karakter");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "password",
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Password berhasil diubah");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Gagal", "Gagal mengubah password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Preferensi notifikasi berhasil diperbarui");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Gagal", "Gagal memperbarui preferensi");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Pengaturan
        </h1>
        <p className="text-muted-foreground">
          Kelola preferensi dan pengaturan akun Anda
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tampilan
          </CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                Terang
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                Gelap
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="flex-1"
              >
                Sistem
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Ubah Password
          </CardTitle>
          <CardDescription>Perbarui password akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimal 6 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" isLoading={isChangingPassword}>
              Ubah Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi
              </CardTitle>
              <CardDescription>Kelola preferensi notifikasi Anda</CardDescription>
            </div>
            <Button onClick={handleSavePreferences} isLoading={isSavingPreferences}>
              Simpan Preferensi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Notifikasi Email</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi melalui email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked: boolean) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">Notifikasi Push</Label>
              <p className="text-sm text-muted-foreground">
                Terima notifikasi push di browser
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked: boolean) =>
                setPreferences({ ...preferences, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inAppNotifications">Notifikasi In-App</Label>
              <p className="text-sm text-muted-foreground">
                Tampilkan notifikasi di dalam aplikasi
              </p>
            </div>
            <Switch
              id="inAppNotifications"
              checked={preferences.inAppNotifications}
              onCheckedChange={(checked: boolean) =>
                setPreferences({ ...preferences, inAppNotifications: checked })
              }
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium">Jenis Notifikasi</p>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="attendanceReminders">Pengingat Absensi</Label>
                <p className="text-sm text-muted-foreground">
                  Pengingat untuk melakukan absensi
                </p>
              </div>
              <Switch
                id="attendanceReminders"
                checked={preferences.attendanceReminders}
                onCheckedChange={(checked: boolean) =>
                  setPreferences({ ...preferences, attendanceReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="leaveApprovals">Persetujuan Izin</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi untuk persetujuan izin
                </p>
              </div>
              <Switch
                id="leaveApprovals"
                checked={preferences.leaveApprovals}
                onCheckedChange={(checked: boolean) =>
                  setPreferences({ ...preferences, leaveApprovals: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="systemUpdates">Update Sistem</Label>
                <p className="text-sm text-muted-foreground">
                  Informasi tentang update dan pemeliharaan sistem
                </p>
              </div>
              <Switch
                id="systemUpdates"
                checked={preferences.systemUpdates}
                onCheckedChange={(checked: boolean) =>
                  setPreferences({ ...preferences, systemUpdates: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
