import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNo } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  serviceId: z.string().min(1),
  pricePlanId: z.string().nullable().optional(),
  paymentMethodId: z.string().nullable().optional(),
  customerNote: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    const service = await prisma.serviceItem.findFirst({
      where: { id: parsed.data.serviceId, status: "PUBLISHED", available: true },
    });
    if (!service) {
      return NextResponse.json({ error: "服务不可用" }, { status: 400 });
    }

    let amount = 0;
    let currency = "CNY";
    const pricePlanId: string | null = parsed.data.pricePlanId || null;

    if (pricePlanId) {
      const plan = await prisma.pricePlan.findFirst({
        where: { id: pricePlanId, serviceId: service.id, enabled: true },
      });
      if (!plan) {
        return NextResponse.json({ error: "价格方案不可用" }, { status: 400 });
      }
      amount = plan.amount;
      currency = plan.currency;
    }

    if (parsed.data.paymentMethodId) {
      const method = await prisma.paymentMethod.findFirst({
        where: { id: parsed.data.paymentMethodId, enabled: true },
      });
      if (!method) {
        return NextResponse.json({ error: "付款方式不可用" }, { status: 400 });
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        serviceId: service.id,
        pricePlanId,
        paymentMethodId: parsed.data.paymentMethodId || null,
        amount,
        currency,
        customerNote: parsed.data.customerNote || "【测试数据】演示订单",
        orderStatus: "PENDING",
        paymentStatus: "UNPAID",
        isDemo: true,
      },
    });

    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "创建订单失败" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const payment = searchParams.get("payment") || "";

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { orderNo: { contains: q } },
                { customerNote: { contains: q } },
                { service: { name: { contains: q } } },
              ],
            }
          : {},
        status ? { orderStatus: status as never } : {},
        payment ? { paymentStatus: payment as never } : {},
      ],
    },
    include: { service: true, paymentMethod: true, pricePlan: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ orders });
}
