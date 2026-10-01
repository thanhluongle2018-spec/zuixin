import Link from "next/link";
import { FeatureStrip, PlatformEntryCards } from "@/components/site/PlatformCards";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { getEntryCards, getSiteSettings } from "@/lib/site";
import { formatDateTime, formatMoney } from "@/lib/utils";

export default async function HomePage() {
  const [settings, cards, tutorials, services] = await Promise.all([
    getSiteSettings(),
    getEntryCards(),
    prisma.tutorial.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ platform: "asc" }, { order: "asc" }],
      take: 4,
    }),
    prisma.serviceItem.findMany({
      where: { status: "PUBLISHED", available: true },
      include: {
        prices: { where: { enabled: true }, orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { order: "asc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <section className="section">
        <div className="container-page">
          <div className="fade-up mx-auto max-w-3xl text-center">
            <Badge tone="orange">{settings.tagline}</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold text-ink md:text-5xl">
              {settings.siteName}
            </h1>
            <p className="mt-4 text-lg text-ink-muted md:text-xl">{settings.homeTitle}</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-soft md:text-base">
              {settings.homeDescription}
            </p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="/ios" className="btn btn-primary">
                苹果手机指南
              </Link>
              <Link href="/android" className="btn btn-secondary">
                安卓手机指南
              </Link>
            </div>
          </div>

          {settings.announcement ? (
            <div className="mx-auto mt-8 max-w-3xl">
              <Alert tone="demo" title="站点公告">
                {settings.announcement}
              </Alert>
            </div>
          ) : null}

          <div className="mt-10">
            <PlatformEntryCards cards={cards} />
          </div>

          <div className="mt-8">
            <FeatureStrip />
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">教程概览</h2>
              <Link href="/faq" className="text-sm font-semibold text-brand-strong">
                常见问题
              </Link>
            </div>
            <div className="space-y-3">
              {tutorials.map((t) => (
                <Link
                  key={t.id}
                  href={t.platform === "android" ? "/android" : t.platform === "ios" ? "/ios" : "/faq"}
                  className="block rounded-xl border border-border bg-bg px-4 py-3 hover:border-brand"
                >
                  <div className="font-semibold">{t.title}</div>
                  <p className="mt-1 text-sm text-ink-muted">{t.summary}</p>
                  <div className="mt-2 text-xs text-ink-soft">
                    约 {t.readingMinutes} 分钟 · 更新于 {formatDateTime(t.updatedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card orange>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">服务价格入口</h2>
              <Link href="/services" className="text-sm font-semibold text-brand-strong">
                查看全部
              </Link>
            </div>
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
                    </div>
                    <Badge>
                      {s.prices[0]
                        ? formatMoney(s.prices[0].amount, s.prices[0].currency)
                        : "面议"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/demo/sms" className="btn btn-primary mt-5">
              打开接码演示
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
}
