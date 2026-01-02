import { auth } from "@/lib/auth";
import { getLandingData } from "@/lib/landing-cms";
import { redirect } from "next/navigation";
import { AdminCMSClient } from "./client";

export const metadata = {
  title: "Landing Page CMS | ATTENDLY",
};

export default async function AdminCMSPage() {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  // Fetch all existing data to pass to client
  // We can reuse getLandingData which returns everything structured
  const data = await getLandingData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Landing Page CMS</h1>
        <p className="text-muted-foreground">
          Kelola konten yang tampil di halaman depan (Welcome Page).
        </p>
      </div>

      <AdminCMSClient initialData={data} />
    </div>
  );
}
