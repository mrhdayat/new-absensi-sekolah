"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LayoutTemplate,
  Users,
  GraduationCap,
  School,
  Calendar,
  ClipboardCheck,
  FileText,
  Settings,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  BookOpen,
  FileQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/generated/prisma";

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "HOMEROOM_TEACHER", "PRINCIPAL", "STUDENT"],
  },
  // Super Admin & Admin
  {
    title: "Pengguna",
    href: "/admin/users",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Data Guru",
    href: "/admin/teachers",
    icon: UserCheck,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Data Siswa",
    href: "/admin/students",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Data Kelas",
    href: "/admin/classes",
    icon: School,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Mata Pelajaran",
    href: "/admin/subjects",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Tahun Ajaran",
    href: "/admin/academic-years",
    icon: Calendar,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Jadwal",
    href: "/admin/schedules",
    icon: Calendar,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Laporan",
    href: "/admin/reports",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Audit Log",
    href: "/admin/audit",
    icon: History,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Landing CMS",
    href: "/admin/cms",
    icon: LayoutTemplate,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // Homeroom Teacher
  {
    title: "Kelas Binaan",
    href: "/homeroom/my-class",
    icon: School,
    roles: ["HOMEROOM_TEACHER"],
  },
  {
    title: "Izin Siswa",
    href: "/homeroom/leave-approvals",
    icon: FileQuestion,
    roles: ["HOMEROOM_TEACHER"],
  },
  // Principal
  {
    title: "Monitoring Guru",
    href: "/principal/teacher-monitoring",
    icon: Users,
    roles: ["PRINCIPAL", "ADMIN"],
  },
  {
    title: "Izin Guru",
    href: "/principal/teacher-leaves",
    icon: FileQuestion,
    roles: ["PRINCIPAL", "ADMIN"],
  },
  {
    title: "Laporan",
    href: "/principal/reports",
    icon: FileText,
    roles: ["PRINCIPAL"],
  },
  // Teacher
  {
    title: "Tandai Kehadiran",
    href: "/teacher/mark-attendance",
    icon: ClipboardCheck,
    roles: ["TEACHER", "HOMEROOM_TEACHER"],
  },
  {
    title: "Jadwal Mengajar",
    href: "/teacher/my-schedule",
    icon: Calendar,
    roles: ["TEACHER", "HOMEROOM_TEACHER"],
  },
  {
    title: "Pengajuan Izin",
    href: "/teacher/leaves",
    icon: FileQuestion,
    roles: ["TEACHER", "HOMEROOM_TEACHER"],
  },
  {
    title: "Absensi Saya",
    href: "/my-attendance",
    icon: ClipboardCheck,
    roles: ["TEACHER", "HOMEROOM_TEACHER"],
  },
  // Student
  {
    title: "Kehadiran Saya",
    href: "/student/my-attendance",
    icon: ClipboardCheck,
    roles: ["STUDENT"],
  },
  {
    title: "Pengajuan Izin",
    href: "/student/leaves",
    icon: FileQuestion,
    roles: ["STUDENT"],
  },
];

export function Sidebar({ userRole, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card flex flex-col",
        "hidden lg:flex"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">A</span>
              </div>
              <span className="font-bold text-xl">ATTENDLY</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
