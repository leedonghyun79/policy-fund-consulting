import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 12;

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET environment variable is missing.");
    }
    return "dev-only-change-me";
  }
  return secret;
}

export function createAdminSessionToken(username: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payload = JSON.stringify({ username, exp });
  const payloadEncoded = base64UrlEncode(payload);
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadEncoded)
    .digest("base64url");
  return `${payloadEncoded}.${signature}`;
}

export function verifyAdminSessionToken(token: string): { username: string } | null {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadEncoded)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSig);

  if (
    signatureBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSigBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as {
      username: string;
      exp: number;
    };
    if (!payload.username || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function getAdminSessionFromCookies() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export function getAdminSessionMaxAgeSec(): number {
  return SESSION_MAX_AGE_SEC;
}
