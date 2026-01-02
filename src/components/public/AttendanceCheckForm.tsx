"use client";

import * as React from "react";
import { Search, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface CheckResult {
  name: string;
  className: string;
  stats: {
    rate: number;
    present: number;
    sick: number;
    permit: number;
    alpha: number;
  };
}

export function AttendanceCheckForm() {
  const { success, error: toastError } = useToast();
  const [nis, setNis] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<CheckResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !birthDate) {
      toastError("Validasi Gagal", "Mohon isi NIS dan Tanggal Lahir");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const res = await fetch("/api/public/attendance-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nis, birthDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Gagal mengambil data";
        setErrorMessage(msg);
        toastError("Gagal", msg);
        return;
      }

      setResult(data.data);
      success("Berhasil", `Data ditemukan untuk siswa: ${data.data.name}`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan sistem");
      toastError("Error", "Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4 items-end justify-center">
        <div className="w-full md:w-1/3 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" /> NIS Siswa
          </label>
          <Input
            placeholder="Contoh: 12345"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Tanggal Lahir
          </label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto">
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? "Memuat..." : (
              <>
                <Search className="h-4 w-4 mr-2" /> Cek Status
              </>
            )}
          </Button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center flex items-center justify-center gap-2">
          <XCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {result && (
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-emerald-950">{result.name}</h3>
                <p className="text-sm text-gray-600">Kelas: {result.className}</p>
                <div className="mt-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  Siswa Aktif
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center w-full md:w-auto">
                <div className="p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">{result.stats.rate}%</div>
                  <div className="text-xs text-muted-foreground">Kehadiran</div>
                </div>
                <div className="p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{result.stats.present}</div>
                  <div className="text-xs text-muted-foreground">Hadir</div>
                </div>
                <div className="p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-amber-500">{result.stats.sick + result.stats.permit}</div>
                  <div className="text-xs text-muted-foreground">Izin/Sakit</div>
                </div>
                <div className="p-3 bg-white rounded-lg border shadow-sm">
                  <div className="text-2xl font-bold text-red-500">{result.stats.alpha}</div>
                  <div className="text-xs text-muted-foreground">Alpha</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
