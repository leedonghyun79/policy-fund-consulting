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

// In-memory rate limiting for consultation form submissions (max 5 per 10 minutes per IP)
const consultRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkConsultRateLimit(ip: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  if (!ip || ip === "unknown") return true;
  const now = Date.now();
  const entry = consultRateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    consultRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req) || "unknown";

    if (!checkConsultRateLimit(clientIp)) {
      return NextResponse.json(
        { message: "단시간 내에 너무 많은 상담 요청이 접수되었습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ConsultPayload;

    const businessName = body.businessName?.trim();
    const representativeName = body.representativeName?.trim();
    const addressRoad = body.addressRoad?.trim();

    if (!businessName || businessName.length > 100) {
      return NextResponse.json({ message: "상호명을 올바르게 입력해주세요 (최대 100자)." }, { status: 400 });
    }
    if (!representativeName || representativeName.length > 50) {
      return NextResponse.json({ message: "대표자명을 올바르게 입력해주세요 (최대 50자)." }, { status: 400 });
    }
    if (!isValidPhonePart(body.phoneMiddle) || !isValidPhonePart(body.phoneLast)) {
      return NextResponse.json({ message: "연락처 형식이 올바르지 않습니다." }, { status: 400 });
    }
    if (!addressRoad || addressRoad.length > 200) {
      return NextResponse.json({ message: "주소를 올바르게 입력해주세요 (최대 200자)." }, { status: 400 });
    }
    if (!isValidIndustry(body.industry)) {
      return NextResponse.json({ message: "업종을 선택해주세요." }, { status: 400 });
    }
    if (!body.agreed) {
      return NextResponse.json({ message: "개인정보 수집 및 이용에 동의해주세요." }, { status: 400 });
    }

    const phoneRaw = `010-${body.phoneMiddle}-${body.phoneLast}`;
    const userAgent = req.headers.get("user-agent")?.slice(0, 500) || null;
    const addressDetail = body.addressDetail?.trim().slice(0, 200) || null;
    const desiredAmountText = body.desiredAmountText?.trim().slice(0, 100) || null;

    console.log("Processing consultation lead submission from IP:", clientIp.slice(0, 15));

    const lead = await (prisma.consultationLead as any).create({
      data: {
        businessName,
        representativeName,
        phoneMiddle: body.phoneMiddle!,
        phoneLast: body.phoneLast!,
        phoneRaw,
        addressRoad,
        addressDetail,
        industry: body.industry!,
        desiredAmountText,
        consentAgreedAt: new Date(),
        consentVersion: body.consentVersion?.trim() || "v1",
        referrer: body.referrer?.slice(0, 500) || null,
        utmSource: body.utmSource?.slice(0, 100) || null,
        utmMedium: body.utmMedium?.slice(0, 100) || null,
        utmCampaign: body.utmCampaign?.slice(0, 100) || null,
        utmTerm: body.utmTerm?.slice(0, 100) || null,
        utmContent: body.utmContent?.slice(0, 100) || null,
        ipAddress: clientIp !== "unknown" ? clientIp : null,
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
