import { IndustryType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendConsultationEmail } from "@/src/lib/mail";

type ConsultPayload = {
  businessName?: string;
  representativeName?: string;
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
    if (!body.representativeName?.trim()) {
      return NextResponse.json({ message: "Representative name is required." }, { status: 400 });
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

    console.log("Creating lead with payload:", {
      businessName: body.businessName?.trim(),
      representativeName: body.representativeName?.trim(),
      phoneRaw,
    });

    const lead = await (prisma.consultationLead as any).create({
      data: {
        businessName: body.businessName!.trim(),
        representativeName: body.representativeName!.trim(),
        phoneMiddle: body.phoneMiddle!,
        phoneLast: body.phoneLast!,
        phoneRaw,
        addressRoad: body.addressRoad!.trim(),
        addressDetail: body.addressDetail?.trim() || null,
        industry: body.industry!,
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

    console.log("Lead created successfully:", lead.id);

    // Send Notification Email
    try {
      await sendConsultationEmail({
        businessName: body.businessName!.trim(),
        representativeName: body.representativeName!.trim(),
        phoneRaw,
        addressRoad: body.addressRoad!.trim(),
        addressDetail: body.addressDetail?.trim(),
        industry: body.industry!,
        desiredAmountText: body.desiredAmountText?.trim(),
      });
      console.log("Email sent successfully.");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Non-critical error, continue
    }

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Consultation create error detailed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await prisma.consultationLead.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        businessName: true,
        representativeName: true,
        industry: true,
        status: true,
      },
    });

    const industryMap: Record<string, string> = {
      MANUFACTURING: "제조업",
      RETAIL: "도·소매업",
      SERVICE: "서비스업",
      FOOD: "요식업",
      OTHER: "기타",
    };

    function maskName(input: string | null): string {
      if (!input) return "-";
      const name = input.trim();
      if (name.length > 2) {
        return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
      } else if (name.length === 2) {
        return name[0] + "*";
      }
      return name;
    }

    const formattedLeads = leads.map((l) => {
      return {
        bizName: maskName(l.businessName),
        repName: maskName(l.representativeName),
        industry: industryMap[l.industry] || "자금컨설팅",
        tag: l.status === "NEW" ? "진행중" : "진행 완료",
      };
    });

    return NextResponse.json({ ok: true, leads: formattedLeads });
  } catch (error) {
    console.error("Fetch recent consults error:", error);
    return NextResponse.json({ message: "Failed to fetch data" }, { status: 500 });
  }
}
