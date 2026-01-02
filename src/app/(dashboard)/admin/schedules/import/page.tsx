"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, Download, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";

interface ScheduleRow {
  className: string;
  subjectCode: string;
  teacherNIP: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
  room: string;
}

export default function ImportSchedulesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<ScheduleRow[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importResults, setImportResults] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, subjectsRes, teachersRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/subjects"),
          fetch("/api/teachers"),
        ]);

        const [classesData, subjectsData, teachersData] = await Promise.all([
          classesRes.json(),
          subjectsRes.json(),
          teachersRes.json(),
        ]);

        if (classesData.success) setClasses(classesData.data);
        if (subjectsData.success) setSubjects(subjectsData.data);
        if (teachersData.success) setTeachers(teachersData.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      error("Error", "Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    setImportResults(null);

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data as ScheduleRow[]);
      },
      error: (err) => {
        error("Error", `Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      error("Error", "No data to import");
      return;
    }

    setIsImporting(true);

    try {
      const res = await fetch("/api/schedules/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: parsedData }),
      });

      const data = await res.json();

      if (data.success) {
        setImportResults(data.data);
        success(
          "Import Complete",
          `${data.data.successCount} schedules imported successfully`
        );
      } else {
        error("Import Failed", data.error);
      }
    } catch (err) {
      error("Error", "Failed to import schedules");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Get sample data
    const sampleClass = classes[0]?.name || "X TKJ 1";
    const sampleSubject = subjects[0]?.code || "MAT";
    const sampleTeacher = teachers[0]?.nip || "198501012010011001";

    const template = `className,subjectCode,teacherNIP,dayOfWeek,startTime,endTime,room
${sampleClass},${sampleSubject},${sampleTeacher},MONDAY,07:30,08:30,Ruang 101
${sampleClass},BIN,${sampleTeacher},MONDAY,08:30,09:30,Ruang 101
${sampleClass},${sampleSubject},${sampleTeacher},TUESDAY,07:30,08:30,Ruang 101`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Import Jadwal Pelajaran</h1>
        <p className="text-muted-foreground">Import jadwal dari file CSV</p>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Petunjuk:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Download template CSV di bawah ini</li>
            <li>Isi data jadwal sesuai format (Kelas, Mata Pelajaran, Guru, dll)</li>
            <li>Gunakan kode/nama yang tersedia di tabel referensi</li>
            <li>Upload file CSV yang sudah diisi</li>
            <li>Preview data dan klik Import</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Reference Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kelas Tersedia</CardTitle>
            <CardDescription>Gunakan nama kelas ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {classes.map((cls) => (
                <div key={cls.id} className="text-sm p-2 rounded border">
                  <p className="font-medium">{cls.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mata Pelajaran</CardTitle>
            <CardDescription>Gunakan kode mata pelajaran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {subjects.map((subject) => (
                <div key={subject.id} className="text-sm p-2 rounded border">
                  <p className="font-medium">{subject.code}</p>
                  <p className="text-xs text-muted-foreground">{subject.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guru</CardTitle>
            <CardDescription>Gunakan NIP guru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="text-sm p-2 rounded border">
                  <p className="font-medium">{teacher.user.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{teacher.nip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day of Week Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hari yang Valid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
              <div key={day} className="px-3 py-1 rounded bg-muted text-sm font-mono">
                {day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File CSV</CardTitle>
          <CardDescription>Pilih file CSV yang berisi data jadwal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {file ? "Change File" : "Upload CSV"}
                </span>
              </Button>
            </label>
          </div>

          {file && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm">
                <strong>File:</strong> {file.name}
              </p>
              <p className="text-sm">
                <strong>Rows:</strong> {parsedData.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {parsedData.length > 0 && !importResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview Data ({parsedData.length} rows)</CardTitle>
                <CardDescription>Menampilkan 10 baris pertama</CardDescription>
              </div>
              <Button onClick={handleImport} isLoading={isImporting}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Import {parsedData.length} Jadwal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Kelas</th>
                    <th className="text-left p-2">Mapel</th>
                    <th className="text-left p-2">NIP Guru</th>
                    <th className="text-left p-2">Hari</th>
                    <th className="text-left p-2">Waktu</th>
                    <th className="text-left p-2">Ruang</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{row.className}</td>
                      <td className="p-2">{row.subjectCode}</td>
                      <td className="p-2 font-mono text-xs">{row.teacherNIP}</td>
                      <td className="p-2">{row.dayOfWeek}</td>
                      <td className="p-2">{row.startTime} - {row.endTime}</td>
                      <td className="p-2">{row.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-600">
                  {importResults.successCount}
                </p>
                <p className="text-sm text-muted-foreground">Berhasil</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-bold text-red-600">{importResults.errorCount}</p>
                <p className="text-sm text-muted-foreground">Gagal</p>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Errors:</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {importResults.errors.map((err: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-red-500/10 text-sm">
                      <strong>Row {err.row}</strong> (Kelas: {err.className}): {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/admin/schedules")}>
              Lihat Jadwal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
