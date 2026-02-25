import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  const mailFrom = process.env.EMAIL_FROM || "no-reply@pixelconnect.co.kr";

  if (!mailTo) {
    console.error("EMAIL_TO is not defined in environment variables.");
    return;
  }

  const subject = `[신규 상담 접수] ${data.businessName} ${data.representativeName}님으로부터 신규 상담이 접수되었습니다.`;
  const html = `
    <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 900;">신규 상담 접수 알림</h1>
        <p style="color: #60a5fa; font-size: 14px; margin: 10px 0 0; font-weight: 700;">PIXELCONNECT CORE ENGINE</p>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 30px;">
          데이터베이스에 새로운 상담 신청이 등록되었습니다. 상세 내용은 다음과 같습니다.
        </p>
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid #f1f5f9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700; width: 120px;">사업자명</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.businessName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700;">대표자명</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.representativeName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700;">연락처</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.phoneRaw}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700;">도로명 주소</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.addressRoad}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700;">상세 주소</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.addressDetail || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700;">업종</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 900;">${data.industry}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 700;">희망 자금</td>
              <td style="padding: 10px 0; color: #2563eb; font-size: 14px; font-weight: 900;">${data.desiredAmountText || "검토중"}</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 40px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_ADMIN_URL || '#'} " style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">어드민 대시보드 확인하기</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">본 메일은 시스템에 의해 자동으로 발송되었습니다.</p>
        <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0;">© PIXELCONNECT SYSTEMS. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject,
      html,
    });
    console.log("Consultation notification email sent successfully.");
  } catch (error) {
    console.error("Failed to send consultation notification email:", error);
  }
}
