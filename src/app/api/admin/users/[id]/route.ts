import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionFromCookies } from "@/src/lib/admin-auth";
import { hashAdminPassword } from "@/src/lib/admin-password";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 현재 로그인한 관리자 정보
    const currentUser = await prisma.adminUser.findUnique({
      where: { username: session.username },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Session user not found." }, { status: 404 });
    }

    // 수정 대상 계정
    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "Target user not found." }, { status: 404 });
    }

    // 권한 체크: SUPER는 모든 계정, MANAGER는 본인만
    const isSelf = currentUser.id === targetUser.id;
    const isSuperAdmin = currentUser.role === "SUPER";

    if (!isSelf && !isSuperAdmin) {
      return NextResponse.json({ message: "Permission denied." }, { status: 403 });
    }

    const body = (await req.json()) as {
      name?: string;
      username?: string;
      password?: string;
      currentPassword?: string;
    };

    const updateData: Record<string, string> = {};

    // 이름 변경
    if (body.name !== undefined) {
      const name = body.name.trim();
      if (name.length < 2) {
        return NextResponse.json({ message: "이름은 2자 이상이어야 합니다." }, { status: 400 });
      }
      updateData.name = name;
    }

    // 아이디 변경
    if (body.username !== undefined) {
      const username = body.username.trim().toLowerCase();
      if (!/^[a-z0-9._-]{4,30}$/.test(username)) {
        return NextResponse.json(
          { message: "아이디는 4~30자의 영문 소문자, 숫자, ., _, - 만 사용 가능합니다." },
          { status: 400 }
        );
      }
      // 중복 체크 (본인 제외)
      const exists = await prisma.adminUser.findFirst({
        where: { username, NOT: { id } },
        select: { id: true },
      });
      if (exists) {
        return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
      }
      updateData.username = username;
    }

    // 비밀번호 변경
    if (body.password !== undefined && body.password !== "") {
      if (body.password.length < 8) {
        return NextResponse.json({ message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
      }
      updateData.passwordHash = hashAdminPassword(body.password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "변경할 항목이 없습니다." }, { status: 400 });
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, username: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const currentUser = await prisma.adminUser.findUnique({
      where: { username: session.username },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Session user not found." }, { status: 404 });
    }

    // Only self can delete
    if (currentUser.id !== id) {
      return NextResponse.json({ message: "Permission denied. You can only delete your own account." }, { status: 403 });
    }

    const isTopAdmin = currentUser.role === "MANAGER";
    if (isTopAdmin) {
      return NextResponse.json({ message: "Top admins cannot be deleted." }, { status: 403 });
    }

    // Remove session cookie if they are deleting themselves
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_session', '', { maxAge: -1 });

    await prisma.adminUser.delete({
      where: { id }
    });

    return response;
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
