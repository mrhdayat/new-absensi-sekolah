import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportData {
  overview: {
    totalRecords: number;
    totalPresent: number;
    overallRate: number;
    trend: number;
  };
  dailyTrend: Array<{
    date: string;
    total: number;
    present: number;
    late: number;
    sick: number;
    permitted: number;
    absent: number;
    attendanceRate: number;
  }>;
  statusDistribution: {
    PRESENT: number;
    LATE: number;
    SICK: number;
    PERMITTED: number;
    ABSENT: number;
  };
  classSummary: Array<{
    className: string;
    total: number;
    present: number;
    attendanceRate: number;
  }>;
}

export function exportToPDF(data: ReportData, filters: { days: number; className?: string }) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Laporan Kehadiran Siswa", 14, 20);

  // Subtitle
  doc.setFontSize(12);
  doc.text(`Periode: ${filters.days} Hari Terakhir`, 14, 28);
  if (filters.className) {
    doc.text(`Kelas: ${filters.className}`, 14, 35);
  }

  // Overview Stats
  doc.setFontSize(14);
  doc.text("Ringkasan", 14, filters.className ? 45 : 38);

  const overviewY = filters.className ? 52 : 45;
  autoTable(doc, {
    startY: overviewY,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Total Catatan", data.overview.totalRecords.toString()],
      ["Total Hadir", data.overview.totalPresent.toString()],
      ["Tingkat Kehadiran", `${data.overview.overallRate}%`],
      ["Trend 7 Hari", `${data.overview.trend >= 0 ? "+" : ""}${data.overview.trend}%`],
    ],
  });

  // Status Distribution
  doc.setFontSize(14);
  const statusY = (doc as any).lastAutoTable.finalY + 10;
  doc.text("Distribusi Status", 14, statusY);

  autoTable(doc, {
    startY: statusY + 5,
    head: [["Status", "Jumlah"]],
    body: [
      ["Hadir", data.statusDistribution.PRESENT.toString()],
      ["Terlambat", data.statusDistribution.LATE.toString()],
      ["Sakit", data.statusDistribution.SICK.toString()],
      ["Izin", data.statusDistribution.PERMITTED.toString()],
      ["Alpha", data.statusDistribution.ABSENT.toString()],
    ],
  });

  // Class Summary
  if (data.classSummary.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Ringkasan per Kelas", 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Kelas", "Total Catatan", "Hadir", "Tingkat Kehadiran"]],
      body: data.classSummary.map((cls) => [
        cls.className,
        cls.total.toString(),
        cls.present.toString(),
        `${cls.attendanceRate}%`,
      ]),
    });
  }

  // Daily Trend (last 10 days)
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Trend Harian (10 Hari Terakhir)", 14, 20);

  const last10Days = data.dailyTrend.slice(-10);
  autoTable(doc, {
    startY: 25,
    head: [["Tanggal", "Total", "Hadir", "Terlambat", "Sakit", "Izin", "Alpha", "Rate (%)"]],
    body: last10Days.map((day) => [
      new Date(day.date).toLocaleDateString("id-ID"),
      day.total.toString(),
      day.present.toString(),
      day.late.toString(),
      day.sick.toString(),
      day.permitted.toString(),
      day.absent.toString(),
      `${day.attendanceRate}%`,
    ]),
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Halaman ${i} dari ${pageCount} - Generated: ${new Date().toLocaleString("id-ID")}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save
  doc.save(`laporan-kehadiran-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportToExcel(data: ReportData, filters: { days: number; className?: string }) {
  const workbook = XLSX.utils.book_new();

  // Overview Sheet
  const overviewData = [
    ["Laporan Kehadiran Siswa"],
    [`Periode: ${filters.days} Hari Terakhir`],
    filters.className ? [`Kelas: ${filters.className}`] : [],
    [],
    ["Ringkasan"],
    ["Metrik", "Nilai"],
    ["Total Catatan", data.overview.totalRecords],
    ["Total Hadir", data.overview.totalPresent],
    ["Tingkat Kehadiran", `${data.overview.overallRate}%`],
    ["Trend 7 Hari", `${data.overview.trend >= 0 ? "+" : ""}${data.overview.trend}%`],
    [],
    ["Distribusi Status"],
    ["Status", "Jumlah"],
    ["Hadir", data.statusDistribution.PRESENT],
    ["Terlambat", data.statusDistribution.LATE],
    ["Sakit", data.statusDistribution.SICK],
    ["Izin", data.statusDistribution.PERMITTED],
    ["Alpha", data.statusDistribution.ABSENT],
  ].filter((row) => row.length > 0);

  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Ringkasan");

  // Class Summary Sheet
  if (data.classSummary.length > 0) {
    const classData = [
      ["Ringkasan per Kelas"],
      [],
      ["Kelas", "Total Catatan", "Hadir", "Tingkat Kehadiran"],
      ...data.classSummary.map((cls) => [
        cls.className,
        cls.total,
        cls.present,
        `${cls.attendanceRate}%`,
      ]),
    ];

    const classSheet = XLSX.utils.aoa_to_sheet(classData);
    XLSX.utils.book_append_sheet(workbook, classSheet, "Per Kelas");
  }

  // Daily Trend Sheet
  const trendData = [
    ["Trend Harian"],
    [],
    ["Tanggal", "Total", "Hadir", "Terlambat", "Sakit", "Izin", "Alpha", "Rate (%)"],
    ...data.dailyTrend.map((day) => [
      new Date(day.date).toLocaleDateString("id-ID"),
      day.total,
      day.present,
      day.late,
      day.sick,
      day.permitted,
      day.absent,
      `${day.attendanceRate}%`,
    ]),
  ];

  const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
  XLSX.utils.book_append_sheet(workbook, trendSheet, "Trend Harian");

  // Save
  XLSX.writeFile(workbook, `laporan-kehadiran-${new Date().toISOString().split("T")[0]}.xlsx`);
}
