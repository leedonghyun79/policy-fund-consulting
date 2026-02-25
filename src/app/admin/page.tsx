import { redirect } from "next/navigation";
import AdminDashboard from "./admin-dashboard";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";

export default async function AdminPage() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    redirect("/admin/login");
  }

  try {
    const leads = await prisma.consultationLead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        businessName: true,
        representativeName: true,
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
        initialLeads={leads.map((row: any) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
          representativeName: row.representativeName ?? '',
        }))}
      />
    );
  } catch (error) {
    console.error("Admin dashboard data fetch error:", error);
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'Pretendard, sans-serif' }}>
        <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>데이터를 불러올 수 없습니다</h1>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
            데이터베이스 연결에 문제가 발생했습니다.<br />
            환경 변수(DATABASE_URL) 설정이나 DB 상태를 확인해 주세요.<br />
            <small style={{ display: 'block', marginTop: '10px', fontSize: '10px', color: '#94a3b8' }}>
              Error: {error instanceof Error ? error.message : "알 수 없는 요인"}
            </small>
          </p>
          <a
            href="/admin"
            style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            대시보드 새로고침
          </a>
        </div>
      </div>
    );
  }
}
