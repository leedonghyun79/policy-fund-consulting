import { LeadStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";

function parseStatus(input: string | null): LeadStatus | null {
  if (!input) return null;
  if (input === LeadStatus.NEW) return LeadStatus.NEW;
  if (input === LeadStatus.CONTACTED) return LeadStatus.CONTACTED;
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = params;
  const body = (await req.json()) as { status?: string };
  const nextStatus = parseStatus(body.status ?? null);
  if (!nextStatus) {
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.consultationLead.update({
    where: { id },
    data: {
      status: nextStatus,
      contactedAt: nextStatus === LeadStatus.CONTACTED ? new Date() : null,
      events: {
        create: {
          type: "STATUS_CHANGED",
          memo: `Status changed to ${nextStatus} by admin`,
        },
      },
    },
    select: { id: true, status: true, contactedAt: true },
  });

  return NextResponse.json({ ok: true, updated });
}
