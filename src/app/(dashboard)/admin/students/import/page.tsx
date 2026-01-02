"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, Download, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

interface StudentRow {
  nis: string;
  nisn: string;
  name: string;
  email: string;
  gender: "MALE" | "FEMALE";
  birthDate: string;
  address: string;
  parentPhone: string;
  classId: string;
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<StudentRow[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importResults, setImportResults] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        if (data.success) {
          setClasses(data.data);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
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
        setParsedData(results.data as StudentRow[]);
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
      const res = await fetch("/api/students/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: parsedData }),
      });

      const data = await res.json();

      if (data.success) {
        setImportResults(data.data);
        success(
          "Import Complete",
          `${data.data.successCount} students imported successfully`
        );
      } else {
        error("Import Failed", data.error);
      }
    } catch (err) {
      error("Error", "Failed to import students");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `nis,nisn,name,email,gender,birthDate,address,parentPhone,classId
12345,0012345678,John Doe,john@example.com,MALE,2005-01-15,Jl. Example No. 1,08123456789,class-id-here
12346,0012345679,Jane Smith,jane@example.com,FEMALE,2005-03-20,Jl. Example No. 2,08123456790,class-id-here`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
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
        <h1 className="text-2xl font-bold">Import Data Siswa</h1>
        <p className="text-muted-foreground">Import siswa dari file CSV</p>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Petunjuk:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Download template CSV di bawah ini</li>
            <li>Isi data siswa sesuai format (NIS, NISN, Nama, Email, dll)</li>
            <li>Untuk classId, gunakan ID kelas yang tersedia di sistem</li>
            <li>Upload file CSV yang sudah diisi</li>
            <li>Preview data dan klik Import</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Available Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Kelas yang Tersedia</CardTitle>
          <CardDescription>Gunakan ID ini untuk kolom classId di CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {classes.map((cls) => (
              <div key={cls.id} className="p-2 rounded border text-sm">
                <p className="font-medium">{cls.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{cls.id}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File CSV</CardTitle>
          <CardDescription>Pilih file CSV yang berisi data siswa</CardDescription>
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
                Import {parsedData.length} Siswa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">NIS</th>
                    <th className="text-left p-2">Nama</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Gender</th>
                    <th className="text-left p-2">Class ID</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{row.nis}</td>
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.email}</td>
                      <td className="p-2">{row.gender}</td>
                      <td className="p-2 font-mono text-xs">{row.classId}</td>
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
                      <strong>Row {err.row}</strong> (NIS: {err.nis}): {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => router.push("/admin/students")}>
              Lihat Data Siswa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
