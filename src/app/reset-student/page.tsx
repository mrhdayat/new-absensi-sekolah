"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Key, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from "@/components/ui/card";

const formSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  code: z.string().length(6, "Kode harus 6 digit angka"),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export default function StudentResetPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nis: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password-delegated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nis: values.nis,
          code: values.code,
          newPassword: values.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        success("Berhasil!", "Password Anda berhasil diperbarui. Silakan login.");
        setTimeout(() => router.push("/login"), 3000); // Auto redirect
      } else {
        error("Gagal Mengubah Password", data.error || "Terjadi kesalahan");
      }
    } catch (err) {
      error("Error", "Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen grid items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-8 bg-white/80 backdrop-blur-sm shadow-xl border-emerald-100">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Password Diperbarui!</h2>
            <p className="text-slate-600 mb-4">
              Password akun Anda telah berhasil diubah. Mengalihkan ke halaman login...
            </p>
            <Button onClick={() => router.push("/login")} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Login Sekarang
            </Button>
          </motion.div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col bg-slate-900 text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-900/20 z-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="h-8 w-8 text-indigo-400" />
            <span className="font-bold text-2xl tracking-tight">ATTENDLY</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Lupa Password Siswa?
          </h1>
          <p className="text-slate-300 text-lg">
            Jangan khawatir. Minta Kode Reset kepada Wali Kelas Anda, lalu masukkan kodenya di sini untuk membuat password baru.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          &copy; 2026 Attendly School System
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-6">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            <span className="font-bold text-2xl text-slate-900">ATTENDLY</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Button variant="ghost" size="sm" className="w-fit mb-2 -ml-2 text-slate-500" onClick={() => router.push("/login")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
              <CardTitle className="text-xl">Reset Password Siswa</CardTitle>
              <CardDescription>
                Masukkan NIS dan Kode 6-Digit yang diberikan oleh Wali Kelas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Induk Siswa (NIS)</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode OTP (dari Wali Kelas)</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" className="font-mono tracking-widest text-center text-lg" maxLength={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Baru</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konfirmasi</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
