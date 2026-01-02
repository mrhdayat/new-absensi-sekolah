"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav, MobileNav } from "@/components/layout/mobile-nav";
import { SkeletonStats } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background p-8">
        <SkeletonStats />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as UserRole,
    avatar: session.user.avatar,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        userRole={user.role}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        userRole={user.role}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-200",
          "lg:pl-[280px]",
          sidebarCollapsed && "lg:pl-20"
        )}
      >
        {/* Header */}
        <Header user={user} onMenuClick={() => setMobileNavOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
