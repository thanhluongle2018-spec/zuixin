import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
  getSession,
} from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "参数无效" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);
    await writeAudit({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      detail: "管理员登录",
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "登录失败" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getSession();
  if (session) {
    await writeAudit({
      userId: session.sub,
      action: "LOGOUT",
      entity: "User",
      entityId: session.sub,
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
