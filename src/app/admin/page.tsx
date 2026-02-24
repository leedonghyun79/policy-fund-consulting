import { redirect } from "next/navigation";
import AdminDashboard from "./admin-dashboard";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";

export default async function AdminPage() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    redirect("/admin/login");
  }

  const leads = await prisma.consultationLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      businessName: true,
      phoneRaw: true,
      addressRoad: true,
      addressDetail: true,
      industry: true,
      desiredAmountText: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <AdminDashboard
      initialLeads={leads.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      }))}
    />
  );
}
