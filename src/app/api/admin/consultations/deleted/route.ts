import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const leads = await prisma.consultationLead.findMany({
      where: {
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: "desc",
      },
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
        deletedAt: true,
      },
    });

    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    console.error("Deleted leads fetch error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
