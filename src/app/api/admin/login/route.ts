import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminCredentials,
  getAdminSessionMaxAgeSec,
} from "@/src/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    const admin = getAdminCredentials();
    if (username !== admin.username || password !== admin.password) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
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
