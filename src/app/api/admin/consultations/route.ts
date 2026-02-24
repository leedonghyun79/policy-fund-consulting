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
        deletedAt: { equals: null },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        events: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    console.error("Admin fetch leads error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
