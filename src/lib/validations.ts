import { z } from "zod";

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  remember: z.boolean().optional(),
});

// User validation
export const userSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "TEACHER",
    "HOMEROOM_TEACHER",
    "PRINCIPAL",
    "STUDENT",
  ]),
  isActive: z.boolean().optional(),
});

// Teacher validation
export const teacherSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]).optional(),
});

// Student validation
export const studentSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  nis: z.string().min(5, "NIS minimal 5 karakter"),
  nisn: z.string().optional(),
  classId: z.string().optional(),
  parentPhone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  birthDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED"]).optional(),
});

// Class validation
export const classSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
  grade: z.string().min(1, "Tingkat wajib diisi"),
  homeroomTeacherId: z.string().optional(),
  academicYearId: z.string().min(1, "Tahun ajaran wajib diisi"),
  capacity: z.number().min(1).max(50).optional(),
});

// Subject validation
export const subjectSchema = z.object({
  code: z.string().min(2, "Kode minimal 2 karakter"),
  name: z.string().min(2, "Nama mata pelajaran minimal 2 karakter"),
  description: z.string().optional(),
});

// Schedule validation
export const scheduleSchema = z.object({
  classId: z.string().min(1, "Kelas wajib diisi"),
  subjectId: z.string().min(1, "Mata pelajaran wajib diisi"),
  teacherId: z.string().min(1, "Guru wajib diisi"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid"),
  room: z.string().optional(),
});

// Teacher attendance validation
export const teacherAttendanceSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID wajib"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

// Student attendance validation
export const studentAttendanceSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID wajib"),
  attendances: z.array(
    z.object({
      studentId: z.string().min(1, "Student ID wajib"),
      status: z.enum(["PRESENT", "LATE", "SICK", "PERMITTED", "ABSENT"]),
      notes: z.string().optional(),
    })
  ),
});

// Leave request validation
export const leaveRequestSchema = z.object({
  studentId: z.string().min(1, "Student ID wajib"),
  startDate: z.string().min(1, "Tanggal mulai wajib"),
  endDate: z.string().min(1, "Tanggal akhir wajib"),
  type: z.enum(["SICK", "FAMILY", "OTHER"]),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
  attachment: z.string().optional(),
});

// Academic year validation
export const academicYearSchema = z.object({
  name: z.string().min(4, "Nama tahun ajaran minimal 4 karakter"),
  startDate: z.string().min(1, "Tanggal mulai wajib"),
  endDate: z.string().min(1, "Tanggal akhir wajib"),
  isActive: z.boolean().optional(),
});

// School settings validation
export const schoolSettingsSchema = z.object({
  schoolName: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  schoolLogo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional(),
  attendanceStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid"),
  attendanceEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid"),
  gracePeriodMinutes: z.number().min(0).max(60).optional(),
  lateThresholdMinutes: z.number().min(0).max(120).optional(),
  enableLocationTracking: z.boolean().optional(),
});

// Schedule bulk import validation
export const scheduleImportRowSchema = z.object({
  className: z.string().min(1, "Nama kelas wajib diisi"),
  subjectCode: z.string().min(1, "Kode mata pelajaran wajib diisi"),
  teacherNIP: z.string().min(1, "NIP guru wajib diisi"),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid (HH:MM)"),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid (HH:MM)"),
  room: z.string().min(1, "Ruangan wajib diisi"),
});

export const bulkScheduleImportSchema = z.object({
  schedules: z.array(scheduleImportRowSchema),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type TeacherAttendanceInput = z.infer<typeof teacherAttendanceSchema>;
export type StudentAttendanceInput = z.infer<typeof studentAttendanceSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type SchoolSettingsInput = z.infer<typeof schoolSettingsSchema>;
export type ScheduleImportRow = z.infer<typeof scheduleImportRowSchema>;
export type BulkScheduleImport = z.infer<typeof bulkScheduleImportSchema>;
