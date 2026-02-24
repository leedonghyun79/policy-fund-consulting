import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/src/lib/admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return res;
}
