import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const industryLabels: Record<string, string> = {
  MANUFACTURING: "제조업",
  RETAIL: "도·소매업",
  SERVICE: "서비스업",
  FOOD: "요식업",
  OTHER: "기타",
};

export async function sendConsultationEmail(data: {
  businessName: string;
  representativeName: string;
  phoneRaw: string;
  addressRoad: string;
  addressDetail?: string | null;
  industry: string;
  desiredAmountText?: string | null;
}) {
  const mailTo = process.env.EMAIL_TO;

  if (!mailTo) {
    console.error("EMAIL_TO is not defined in environment variables.");
    return;
  }

  const subject = `[신규 상담 접수] ${data.businessName} (${data.representativeName}님)`;

  const html = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 900;">📋 신규 상담 접수 알림</h1>
        <p style="color: #60a5fa; font-size: 13px; margin: 10px 0 0; font-weight: 700;">정책자금 컨설팅 시스템</p>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-bottom: 28px;">
          새로운 상담 신청이 접수되었습니다. 아래 내용을 확인해 주세요.
        </p>
        <div style="background-color: #f8fafc; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700; width: 110px;">사업자명</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.businessName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700;">대표자명</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.representativeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700;">연락처</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.phoneRaw}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700;">도로명 주소</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 14px;">${data.addressRoad}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700;">상세 주소</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 14px;">${data.addressDetail || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700;">업종</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 14px;">${industryLabels[data.industry] || data.industry}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 700;">희망 자금</td>
              <td style="padding: 12px 0; color: #2563eb; font-size: 14px; font-weight: 900;">${data.desiredAmountText || "미입력"}</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_ADMIN_URL || 'https://policy-fund.netlify.app/admin'}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px;">
            어드민 대시보드에서 확인하기 →
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">본 메일은 시스템에 의해 자동으로 발송되었습니다.</p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "정책자금 컨설팅 <onboarding@resend.dev>",
    to: [mailTo],
    subject,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw error;
  }

  console.log("Consultation notification email sent via Resend.");
}
