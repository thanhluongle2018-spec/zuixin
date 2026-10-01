import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processDemoPayment } from "@/lib/payment/provider";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { paymentMethod: true },
    });
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }
    if (!order.isDemo) {
      return NextResponse.json({ error: "非演示订单不可使用模拟付款" }, { status: 400 });
    }
    if (order.paymentMethod && !order.paymentMethod.isDemo) {
      return NextResponse.json(
        { error: "当前付款方式未标记为演示，且真实支付尚未接入" },
        { status: 400 }
      );
    }

    const result = await processDemoPayment();
    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        orderStatus: order.orderStatus === "PENDING" ? "PROCESSING" : order.orderStatus,
        paidAt: new Date(result.paidAt),
        customerNote: order.customerNote?.includes("模拟已付款")
          ? order.customerNote
          : `${order.customerNote || ""} · 模拟已付款`.trim(),
      },
    });

    return NextResponse.json({
      order: updated,
      message: result.message,
      mode: "demo",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "模拟付款失败" },
      { status: 500 }
    );
  }
}
