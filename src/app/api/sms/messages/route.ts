import { NextRequest, NextResponse } from "next/server";
import { listDemoMessages, getSmsMode } from "@/lib/sms/provider";

export async function GET(req: NextRequest) {
  const mode = await getSmsMode();
  const numberId = new URL(req.url).searchParams.get("numberId");
  if (!numberId) {
    return NextResponse.json({ error: "缺少 numberId" }, { status: 400 });
  }
  if (mode !== "demo") {
    return NextResponse.json({ error: "真实模式尚未启用" }, { status: 400 });
  }
  const messages = await listDemoMessages(numberId);
  return NextResponse.json({
    mode: "demo",
    notice: "演示模式，未连接真实服务",
    messages,
  });
}
