import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney } from "@/lib/utils";

export default async function ServicesPage() {
  const services = await prisma.serviceItem.findMany({
    where: { status: "PUBLISHED" },
    include: {
      prices: { where: { enabled: true }, orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container-page section space-y-6">
      <Card orange>
        <Badge>服务与价格</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">服务目录</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          以下为管理员发布的服务项目与价格方案。价格与状态来自数据层，可随时在后台更新。
        </p>
      </Card>

      <Alert tone="demo" title="演示说明">
        当前订单付款为模拟流程。本站不代注册、不买卖账号，也不收集密码或恢复码。
      </Alert>

      {!services.length ? (
        <Card>
          <EmptyState title="暂无已发布服务" description="管理员发布后将显示在这里。" />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="orange">{service.category}</Badge>
                <Badge tone={service.available ? "success" : "warning"}>
                  {service.available ? "可用" : "暂不可用"}
                </Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold">{service.name}</h2>
              <p className="mt-2 text-sm text-ink-muted">{service.description}</p>
              {service.notes ? (
                <p className="mt-2 rounded-xl bg-bg px-3 py-2 text-sm text-ink-soft">注意：{service.notes}</p>
              ) : null}
              <div className="mt-4 space-y-2">
                {service.prices.length ? (
                  service.prices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-orange px-3 py-3"
                    >
                      <div>
                        <div className="font-semibold">{price.name}</div>
                        <div className="text-xs text-ink-soft">
                          计价单位：{price.unit} · 更新于 {formatDateTime(price.updatedAt)}
                        </div>
                        {price.description ? (
                          <p className="mt-1 text-sm text-ink-muted">{price.description}</p>
                        ) : null}
                      </div>
                      <div className="text-right font-display text-xl font-semibold text-brand-strong">
                        {formatMoney(price.amount, price.currency)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-soft">暂无启用的价格方案</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
