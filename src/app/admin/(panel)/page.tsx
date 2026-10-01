import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [orderCount, pending, paid, services, audits, settings] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.serviceItem.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);

  const stats = [
    { label: "订单总数", value: orderCount },
    { label: "待处理订单", value: pending },
    { label: "已付款订单", value: paid },
    { label: "服务条目", value: services.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">仪表盘</h1>
        <p className="mt-1 text-sm text-ink-muted">概览订单、服务状态与最近变更</p>
      </div>

      {settings?.demoMode ? (
        <div className="alert alert-demo">当前站点处于演示模式（付款与接码均为模拟）。</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} orange className="!p-4">
            <div className="text-sm text-ink-soft">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold text-brand-strong">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">服务状态</h2>
            <Link href="/admin/services" className="text-sm font-semibold text-brand-strong">
              管理
            </Link>
          </div>
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-bg px-3 py-2">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-ink-soft">{s.category}</div>
                </div>
                <Badge tone={s.status === "PUBLISHED" ? "success" : "warning"}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">最近变更</h2>
            <Link href="/admin/audit" className="text-sm font-semibold text-brand-strong">
              全部
            </Link>
          </div>
          <div className="space-y-2">
            {audits.map((a) => (
              <div key={a.id} className="rounded-xl border border-border px-3 py-2">
                <div className="text-sm font-medium">
                  {a.action} · {a.entity}
                </div>
                <div className="text-xs text-ink-soft">
                  {a.user?.name || "系统"} · {formatDateTime(a.createdAt)}
                </div>
                {a.detail ? <div className="mt-1 text-xs text-ink-muted">{a.detail}</div> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
