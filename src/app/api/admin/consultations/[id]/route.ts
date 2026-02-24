import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";

export async function DELETE(
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
        deletedAt: new Date(),
        events: {
          create: {
            type: "SOFT_DELETED",
            memo: `Record soft deleted by admin`,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: "Delete failed." }, { status: 500 });
  }
}
