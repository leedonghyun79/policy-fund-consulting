import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAgeSec,
} from "@/src/lib/admin-auth";
import { prisma } from "@/src/lib/prisma";
import { verifyAdminPassword } from "@/src/lib/admin-password";

// In-memory brute force protection (max 5 failed attempts per 15 minutes per username)
const loginAttemptMap = new Map<string, { failedCount: number; lockedUntil: number }>();

function getAttemptKey(username: string): string {
  return `login:${username.toLowerCase().trim()}`;
}

function checkLoginLockout(key: string): { isLocked: boolean; remainingSec: number } {
  const entry = loginAttemptMap.get(key);
  if (!entry) return { isLocked: false, remainingSec: 0 };
  const now = Date.now();
  if (now < entry.lockedUntil) {
    return { isLocked: true, remainingSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  return { isLocked: false, remainingSec: 0 };
}

function recordFailedLogin(key: string): void {
  const now = Date.now();
  const entry = loginAttemptMap.get(key) || { failedCount: 0, lockedUntil: 0 };
  entry.failedCount += 1;
  if (entry.failedCount >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // 15분 잠금
  }
  loginAttemptMap.set(key, entry);
}

function resetLoginAttempts(key: string): void {
  loginAttemptMap.delete(key);
}

// Dummy hash for constant-time comparison when user not found
const DUMMY_HASH =
  "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ message: "아이디와 비밀번호를 모두 입력해주세요." }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const lockKey = getAttemptKey(cleanUsername);

    const { isLocked, remainingSec } = checkLoginLockout(lockKey);
    if (isLocked) {
      const remainingMin = Math.ceil(remainingSec / 60);
      return NextResponse.json(
        { message: `연속된 로그인 실패로 계정이 일시 잠금되었습니다. ${remainingMin}분 후 다시 시도해 주세요.` },
        { status: 429 }
      );
    }

    const dbAdmin = await prisma.adminUser.findUnique({
      where: { username: cleanUsername },
      select: { username: true, passwordHash: true },
    });

    const isPasswordValid = dbAdmin
      ? verifyAdminPassword(password, dbAdmin.passwordHash)
      : verifyAdminPassword(password, DUMMY_HASH) && false;

    if (!dbAdmin || !isPasswordValid) {
      recordFailedLogin(lockKey);
      return NextResponse.json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // Reset failed counter on successful login
    resetLoginAttempts(lockKey);

    const token = createAdminSessionToken(cleanUsername);
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
