"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Key, ArrowLeft, Loader2, CheckCircle2, ShieldQuestion, Send } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Schema Step 1: Email Only
const emailSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

// Schema Step 2: OTP + Password
const resetSchema = z.object({
  code: z.string().length(6, "Kode harus 6 digit"),
  newPassword: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: Success
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form 1
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // Form 2
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  // Handle Send OTP
  async function onRequestOtp(values: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await res.json();

      if (res.ok) {
        setEmail(values.email);
        setStep(2);
        success("OTP Terkirim!", "Cek email Anda (atau Console Log jika mode Mock) untuk mendapatkan kode OTP.");
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Reset Password
  async function onResetPassword(values: z.infer<typeof resetSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: values.code,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(3);
        success("Berhasil!", "Password telah diubah.");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        error("Gagal", data.error);
      }
    } catch (err) {
      error("Error", "Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Visual */}
      <div className="hidden lg:flex flex-col bg-slate-900 text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 z-0" />
        <div className="relative z-10 flex items-center gap-2">
          <ShieldQuestion className="h-8 w-8 text-blue-400" />
          <span className="font-bold text-2xl tracking-tight">ATTENDLY</span>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Keamanan Akun Utama
          </h1>
          <p className="text-slate-300 text-lg">
            Proses pemulihan akun yang aman menggunakan verifikasi OTP Email.
            Melindungi data sekolah dari akses yang tidak sah.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-400">
          &copy; 2026 Attendly School System
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <Button variant="ghost" size="sm" className="w-fit mb-2 -ml-2 text-slate-500" onClick={() => router.push("/login")}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Kembali Login
                    </Button>
                    <CardTitle>Lupa Password?</CardTitle>
                    <CardDescription>Kami akan mengirimkan kode OTP ke email terdaftar Anda.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(onRequestOtp)} className="space-y-4">
                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="nama@sekolah.sch.id" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                          Kirim Kode OTP
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <Button variant="ghost" size="sm" className="w-fit mb-2 -ml-2 text-slate-500" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Ganti Email
                    </Button>
                    <CardTitle>Verifikasi & Reset</CardTitle>
                    <CardDescription>
                      Masukkan kode OTP yang dikirim ke <span className="font-semibold text-primary">{email}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...resetForm}>
                      <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                        <FormField
                          control={resetForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kode OTP (6 Angka)</FormLabel>
                              <FormControl>
                                <Input placeholder="XXXXXX" className="text-center tracking-widest text-lg font-mono" maxLength={6} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 mt-2">
                          <FormField
                            control={resetForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password Baru</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={resetForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Konfirmasi Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                          Ubah Password
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-xl shadow-xl border border-green-100 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Sukses!</h2>
                <p className="text-slate-600 mb-6">Password akun Anda telah berhasil diperbarui.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => router.push("/login")}>
                  Login Sekarang
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
