import { NextRequest, NextResponse } from "next/server";
import { listDemoNumbers, rentDemoNumber, getSmsMode } from "@/lib/sms/provider";
import { z } from "zod";

export async function GET() {
  const mode = await getSmsMode();
  const numbers = await listDemoNumbers();
  return NextResponse.json({
    mode,
    notice: "演示模式，未连接真实服务",
    numbers,
  });
}

const schema = z.object({
  service: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const mode = await getSmsMode();
  if (mode !== "demo") {
    return NextResponse.json({ error: "真实模式尚未启用" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const number = await rentDemoNumber(parsed.data.service || "通用演示");
  return NextResponse.json({
    mode: "demo",
    notice: "演示模式，未连接真实服务",
    number,
  });
}
