import { IndustryType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type ConsultPayload = {
  businessName?: string;
  phoneMiddle?: string;
  phoneLast?: string;
  addressRoad?: string;
  addressDetail?: string;
  industry?: string;
  desiredAmountText?: string;
  agreed?: boolean;
  consentVersion?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

function extractClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

function isValidPhonePart(value?: string): value is string {
  return typeof value === "string" && /^[0-9]{4}$/.test(value);
}

function isValidIndustry(value?: string): value is IndustryType {
  if (!value) return false;
  return Object.values(IndustryType).includes(value as IndustryType);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ConsultPayload;

    if (!body.businessName?.trim()) {
      return NextResponse.json({ message: "Business name is required." }, { status: 400 });
    }
    if (!isValidPhonePart(body.phoneMiddle) || !isValidPhonePart(body.phoneLast)) {
      return NextResponse.json({ message: "Phone number format is invalid." }, { status: 400 });
    }
    if (!body.addressRoad?.trim()) {
      return NextResponse.json({ message: "Address is required." }, { status: 400 });
    }
    if (!isValidIndustry(body.industry)) {
      return NextResponse.json({ message: "Industry value is invalid." }, { status: 400 });
    }
    if (!body.agreed) {
      return NextResponse.json({ message: "Consent is required." }, { status: 400 });
    }

    const phoneRaw = `010-${body.phoneMiddle}-${body.phoneLast}`;
    const userAgent = req.headers.get("user-agent");

    const lead = await prisma.consultationLead.create({
      data: {
        businessName: body.businessName.trim(),
        phoneMiddle: body.phoneMiddle!,
        phoneLast: body.phoneLast!,
        phoneRaw,
        addressRoad: body.addressRoad.trim(),
        addressDetail: body.addressDetail?.trim() || null,
        industry: body.industry,
        desiredAmountText: body.desiredAmountText?.trim() || null,
        consentAgreedAt: new Date(),
        consentVersion: body.consentVersion?.trim() || "v1",
        referrer: body.referrer || null,
        utmSource: body.utmSource || null,
        utmMedium: body.utmMedium || null,
        utmCampaign: body.utmCampaign || null,
        utmTerm: body.utmTerm || null,
        utmContent: body.utmContent || null,
        ipAddress: extractClientIp(req),
        userAgent,
        events: {
          create: { type: "CREATED", memo: "Landing form submission" },
        },
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Consultation create error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
