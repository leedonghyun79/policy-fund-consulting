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

const industryMap: Record<string, IndustryType> = {
  제조업: IndustryType.MANUFACTURING,
  "도·소매업": IndustryType.RETAIL,
  서비스업: IndustryType.SERVICE,
  요식업: IndustryType.FOOD,
  기타: IndustryType.OTHER,
};

function extractClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }
  return req.headers.get("x-real-ip");
}

function isValidPhonePart(value?: string): value is string {
  return typeof value === "string" && /^[0-9]{4}$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ConsultPayload;

    if (!body.businessName?.trim()) {
      return NextResponse.json({ message: "사업자명은 필수입니다." }, { status: 400 });
    }
    if (!isValidPhonePart(body.phoneMiddle) || !isValidPhonePart(body.phoneLast)) {
      return NextResponse.json({ message: "휴대폰 번호 형식이 올바르지 않습니다." }, { status: 400 });
    }
    if (!body.addressRoad?.trim()) {
      return NextResponse.json({ message: "주소는 필수입니다." }, { status: 400 });
    }
    if (!body.industry || !industryMap[body.industry]) {
      return NextResponse.json({ message: "업종 값이 유효하지 않습니다." }, { status: 400 });
    }
    if (!body.agreed) {
      return NextResponse.json({ message: "개인정보 동의가 필요합니다." }, { status: 400 });
    }

    const phoneRaw = `010-${body.phoneMiddle}-${body.phoneLast}`;
    const userAgent = req.headers.get("user-agent");

    const lead = await prisma.consultationLead.create({
      data: {
        businessName: body.businessName.trim(),
        phoneMiddle: body.phoneMiddle,
        phoneLast: body.phoneLast,
        phoneRaw,
        addressRoad: body.addressRoad.trim(),
        addressDetail: body.addressDetail?.trim() || null,
        industry: industryMap[body.industry],
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
          create: {
            type: "CREATED",
            memo: "Landing form submission",
          },
        },
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Consultation create error:", error);
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
