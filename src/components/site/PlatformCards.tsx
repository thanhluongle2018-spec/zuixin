import Link from "next/link";
import { Smartphone, TabletSmartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function PlatformEntryCards({
  cards,
}: {
  cards: Array<{
    id: string;
    platform: string;
    title: string;
    description: string;
    href: string;
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card, index) => {
        const isIos = card.platform === "ios";
        const Icon = isIos ? Smartphone : TabletSmartphone;
        return (
          <Link
            key={card.id}
            href={card.href}
            className={`card-orange group block p-6 transition hover:-translate-y-1 hover:border-brand ${
              index === 0 ? "fade-up-delay" : "fade-up-delay-2"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge tone="orange">{isIos ? "苹果手机" : "安卓手机"}</Badge>
              <span className="rounded-2xl bg-brand p-3 text-white shadow-soft transition group-hover:scale-105">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-base">{card.description}</p>
            <div className="mt-5 text-sm font-semibold text-brand-strong">查看完整指南 →</div>
          </Link>
        );
      })}
    </div>
  );
}

export function FeatureStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[
        { title: "教程概览", href: "/ios", desc: "分步骤说明，适合新手阅读" },
        { title: "服务价格", href: "/services", desc: "查看已发布服务与价格方案" },
        { title: "接码演示", href: "/demo/sms", desc: "模拟号码与验证码流程" },
      ].map((item) => (
        <Card key={item.href} orange className="!p-4">
          <Link href={item.href} className="block">
            <div className="font-semibold text-ink">{item.title}</div>
            <p className="mt-1 text-sm text-ink-muted">{item.desc}</p>
          </Link>
        </Card>
      ))}
    </div>
  );
}
