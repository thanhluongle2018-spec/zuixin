import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export default async function FaqPage() {
  const faqs = await prisma.faqItem.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container-page section space-y-6">
      <Card orange>
        <Badge>FAQ</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold">常见问题</h1>
        <p className="mt-3 text-ink-muted">内容可由管理员在后台维护，并显示更新时间。</p>
      </Card>

      <Card>
        {!faqs.length ? (
          <EmptyState title="暂无常见问题" />
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="rounded-xl border border-border bg-bg px-4 py-3">
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-sm text-ink-muted">{faq.answer}</p>
                <p className="mt-2 text-xs text-ink-soft">更新于 {formatDateTime(faq.updatedAt)}</p>
              </details>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
