import { CreateDemoOrderForm } from "@/components/site/CreateDemoOrderForm";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import {
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/utils";

export default async function OrdersPage() {
  const [orders, services, methods] = await Promise.all([
    prisma.order.findMany({
      include: { service: true, paymentMethod: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.serviceItem.findMany({
      where: { status: "PUBLISHED", available: true },
      include: { prices: { where: { enabled: true }, orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.paymentMethod.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="container-page section space-y-6">
      <Card orange>
        <Badge>订单与付款</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">订单与付款说明</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          了解下单流程、订单状态与付款状态。未配置真实支付渠道时，仅提供明确标记的模拟付款。
        </p>
      </Card>

      <Alert tone="demo" title="演示模式 · 模拟付款">
        模拟付款不会产生真实扣款，也不会伪造真实支付渠道成功回执。演示订单均标记为测试数据。
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <h2 className="font-display text-xl font-semibold">下单流程</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-muted">
            <li>选择已发布的服务与价格方案</li>
            <li>创建演示订单（标记为测试数据）</li>
            <li>选择已启用的付款方式</li>
            <li>若为模拟付款，确认后订单显示“已付款（模拟）”</li>
            <li>管理员可在后台查看并更新订单状态</li>
          </ol>
          <div className="mt-5 space-y-2 text-sm">
            <div>
              <Badge tone="warning">待处理</Badge>
              <span className="ml-2 text-ink-muted">订单已创建，等待处理</span>
            </div>
            <div>
              <Badge tone="info">处理中</Badge>
              <span className="ml-2 text-ink-muted">服务处理进行中</span>
            </div>
            <div>
              <Badge tone="success">已完成</Badge>
              <span className="ml-2 text-ink-muted">流程结束</span>
            </div>
            <div>
              <Badge tone="orange">已付款（模拟）</Badge>
              <span className="ml-2 text-ink-muted">仅演示，非真实扣款</span>
            </div>
          </div>
        </Card>

        <CreateDemoOrderForm
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            prices: s.prices.map((p) => ({
              id: p.id,
              name: p.name,
              amount: p.amount,
              currency: p.currency,
              unit: p.unit,
            })),
          }))}
          methods={methods.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            isDemo: m.isDemo,
          }))}
        />
      </div>

      <Card>
        <h2 className="font-display text-xl font-semibold">最近演示订单</h2>
        <div className="table-wrap mt-4">
          <table className="data">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>服务</th>
                <th>金额</th>
                <th>订单状态</th>
                <th>付款状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="font-medium">{order.orderNo}</div>
                    {order.isDemo ? <Badge tone="warning">测试数据</Badge> : null}
                  </td>
                  <td>{order.service.name}</td>
                  <td>{formatMoney(order.amount, order.currency)}</td>
                  <td>
                    <Badge tone="info">{orderStatusLabel(order.orderStatus)}</Badge>
                  </td>
                  <td>
                    <Badge tone={order.paymentStatus === "PAID" ? "success" : "warning"}>
                      {paymentStatusLabel(order.paymentStatus)}
                    </Badge>
                  </td>
                  <td>{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
