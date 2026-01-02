"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { User, Mail, Shield, Camera, Save, Loader2, Lock } from "lucide-react";
import { getInitials, formatRole } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Profile Form
  const [formData, setFormData] = React.useState({
    name: "",
  });
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  // Email Change State
  const [isEmailDialogOpen, setIsEmailDialogOpen] = React.useState(false);
  const [emailStep, setEmailStep] = React.useState<1 | 2>(1);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");

  React.useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name,
      });
    }
  }, [session]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          name: formData.name, // Only name update here
          avatar: avatarPreview,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success("Berhasil", "Profil diperbarui");
        setIsEditing(false);
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            avatar: avatarPreview || session?.user?.avatar,
          },
        });
        router.refresh();
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    if (!newEmail || !currentPassword) {
      error("Error", "Isi semua field");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch("/api/profile/update-email/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, currentPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStep(2);
        success("OTP Terkirim", "Cek email BARU Anda (atau Console).");
      } else {
        error("Gagal", data.error);
      }
    } catch (e) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setEmailLoading(false);
    }
  }

  const handleVerifyEmail = async () => {
    if (!otpCode) return;
    setEmailLoading(true);
    try {
      const res = await fetch("/api/profile/update-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, code: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        success("Sukses", "Email berhasil diubah!");
        setIsEmailDialogOpen(false);
        // Reset State
        setNewEmail("");
        setCurrentPassword("");
        setOtpCode("");
        setEmailStep(1);
        // Update Session
        await update();
        router.refresh();
      } else {
        error("Gagal", data.error);
      }
    } catch (e) {
      error("Error", "Terjadi kesalahan");
    } finally {
      setEmailLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">
            Atur informasi profil dan keamanan akun
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profil</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Simpan
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={avatarPreview || user.avatar || undefined}
                  alt={user.name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  {/* Email Removed from Quick Edit */}
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {user.email} <Badge variant="outline" className="ml-2 text-xs font-normal">Terverifikasi</Badge>
                  </CardDescription>
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-sm">
                      {formatRole(user.role)}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Account Security Section */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Detail yang terlihat oleh pengguna lain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nama Lengkap</p>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{formatRole(user.role)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
              <CardDescription>Update email dan password Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEmailDialogOpen(true)}>
                  Ubah
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">********</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/forgot-password")}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Change Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Alamat Email</DialogTitle>
            <DialogDescription>
              {emailStep === 1
                ? "Masukkan email baru Anda. Kami akan mengirimkan OTP ke alamat tersebut."
                : `Aksi verifikasi. Masukkan OTP yang dikirim ke ${newEmail}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {emailStep === 1 ? (
              <>
                <div className="space-y-2">
                  <Label>Email Baru</Label>
                  <Input
                    placeholder="new@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Saat Ini (Verifikasi)</Label>
                  <Input
                    type="password"
                    placeholder="********"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-sky-50 text-sky-700 rounded-lg text-sm">
                  Kode OTP telah dikirim ke <strong>{newEmail}</strong>. <br />
                  Jika memakai Mock Mode, cek terminal sistem.
                </div>
                <div className="space-y-2">
                  <Label>Masukan 6 Digit OTP</Label>
                  <Input
                    placeholder="XXXXXX"
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {emailStep === 1 ? (
              <Button onClick={handleRequestEmailOtp} disabled={emailLoading}>
                {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim OTP
              </Button>
            ) : (
              <Button onClick={handleVerifyEmail} disabled={emailLoading} className="w-full">
                {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verifikasi & Ubah
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
