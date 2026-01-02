"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { PasswordEyeAnimation } from "@/components/ui/password-eye-animation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: toastError, success } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        remember: data.remember, // Pass remember value
        redirect: false,
      });

      if (result?.error) {
        toastError("Login Gagal", result.error);
      } else {
        success("Login Berhasil", "Selamat datang kembali!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toastError("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md px-4"
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-0">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4"
          >
            <span className="font-bold text-primary-foreground text-2xl">A</span>
          </motion.div>
          <CardTitle className="text-2xl font-bold">ATTENDLY</CardTitle>
          <CardDescription className="text-base">
            Smart Attendance System
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@sekolah.sch.id"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Password with Animation */}
            <div className="space-y-2">
              <Label htmlFor="password" required>Password</Label>

              {/* Animated Character */}
              <div className="flex justify-center mb-2">
                <PasswordEyeAnimation isVisible={showPassword} />
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-input"
                  {...register("remember")}
                />
                Ingat saya
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </a>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {!isLoading && <LogIn className="h-4 w-4 mr-2" />}
              Masuk
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 ATTENDLY. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-md px-4">
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-0">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted animate-pulse mb-4" />
          <div className="h-8 w-32 mx-auto bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 mx-auto bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
