import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashAdminPassword } from "@/src/lib/admin-password";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ message: "일치하는 관리자 정보가 없습니다." }, { status: 404 });
    }

    const masterEmail = process.env.EMAIL_TO;
    if (!masterEmail) {
      return NextResponse.json({ message: "수신자 이메일 설정이 누락되었습니다." }, { status: 500 });
    }

    // Generate random 8-character temp password
    const tempPassword = crypto.randomBytes(4).toString("hex");
    const newPasswordHash = hashAdminPassword(tempPassword);

    await prisma.adminUser.update({
      where: { username },
      data: { passwordHash: newPasswordHash },
    });

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "비티씨 시스템 <noreply@btccompany.co.kr>",
      to: masterEmail,
      subject: "[비티씨 시스템] 관리자 임시 비밀번호 발급 안내",
      html: `
        <div style="font-family: Pretendard, sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">임시 비밀번호가 발급되었습니다</h2>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            요청하신 관리자 계정(<strong>${username}</strong>)의 임시 비밀번호 안내입니다.
          </p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 24px; font-weight: bold; color: #0f172a; text-align: center; margin: 30px 0;">
            ${tempPassword}
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            보안을 위해 로그인 후 반드시 <strong>어드민 대시보드 - 계정 관리</strong>에서 비밀번호를 새롭게 변경해주시기 바랍니다.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">
            본 메일은 발신 전용이며 회신되지 않습니다.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ message: "이메일 발송에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "이메일로 임시 비밀번호가 발송되었습니다." });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
