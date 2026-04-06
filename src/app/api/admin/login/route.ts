import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAgeSec,
} from "@/src/lib/admin-auth";
import { prisma } from "@/src/lib/prisma";
import { verifyAdminPassword } from "@/src/lib/admin-password";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    const dbAdmin = await prisma.adminUser.findUnique({
      where: { username },
      select: { username: true, passwordHash: true },
    });

    if (!dbAdmin || !verifyAdminPassword(password, dbAdmin.passwordHash)) {
      return NextResponse.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const token = createAdminSessionToken(username);
    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getAdminSessionMaxAgeSec(),
    });
    return res;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
