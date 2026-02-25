import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";
import { hashAdminPassword } from "@/src/lib/admin-password";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("Admin user list error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      username?: string;
      password?: string;
      role?: string;
    };

    const name = (body.name ?? "").trim();
    const username = (body.username ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const role = (body.role ?? "MANAGER").trim();

    if (name.length < 2) {
      return NextResponse.json({ message: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (!/^[a-z0-9._-]{4,30}$/.test(username)) {
      return NextResponse.json(
        { message: "Username must be 4-30 chars and use lowercase letters, numbers, ., _, - only." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const exists = await prisma.adminUser.findUnique({
      where: { username },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({ message: "Username already exists." }, { status: 409 });
    }

    const created = await prisma.adminUser.create({
      data: {
        name,
        username,
        role,
        passwordHash: hashAdminPassword(password),
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user: created }, { status: 201 });
  } catch (error) {
    console.error("Admin user create error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
