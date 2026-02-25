import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const updated = await prisma.consultationLead.update({
      where: { id },
      data: {
        deletedAt: null,
        events: {
          create: {
            type: "RESTORED",
            memo: `Record restored by admin`,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ message: "Restore failed." }, { status: 500 });
  }
}
