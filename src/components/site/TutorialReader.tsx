"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";

type Step = {
  id: string;
  title: string;
  body: string;
  tip?: string | null;
  sourceUrl?: string | null;
  sourceNote?: string | null;
  order: number;
};

type Faq = {
  id: string;
  question: string;
  answer: string;
};

export function TutorialReader({
  title,
  summary,
  readingMinutes,
  updatedAt,
  steps,
  faqs,
}: {
  title: string;
  summary: string;
  readingMinutes: number;
  updatedAt: string;
  steps: Step[];
  faqs: Faq[];
}) {
  const [active, setActive] = useState(steps[0]?.id || "");
  const [progress, setProgress] = useState(0);

  const ordered = useMemo(() => [...steps].sort((a, b) => a.order - b.order), [steps]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((el.scrollTop / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Card className="!p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">目录</div>
            <Badge tone="orange">阅读 {progress}%</Badge>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-brand-tint">
            <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <nav className="space-y-1" aria-label="教程目录">
            {ordered.map((step, idx) => (
              <a
                key={step.id}
                href={`#step-${step.id}`}
                onClick={() => setActive(step.id)}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active === step.id
                    ? "bg-brand-tint font-semibold text-brand-strong"
                    : "text-ink-muted hover:bg-bg-soft"
                }`}
              >
                {idx + 1}. {step.title}
              </a>
            ))}
          </nav>
        </Card>
      </aside>

      <div className="space-y-4">
        <Card orange>
          <Badge tone="orange">预计阅读 {readingMinutes} 分钟</Badge>
          <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="mt-3 text-ink-muted">{summary}</p>
          <p className="mt-3 text-xs text-ink-soft">内容更新时间：{updatedAt}</p>
        </Card>

        <Alert tone="warning" title="重要提示">
          本站不代用户注册账号、不买卖账号、不收集账号密码或恢复码。接码、VPN、静态住宅
          IP 不能保证账号安全，也无法绕过平台风控。
        </Alert>

        {ordered.map((step, idx) => (
          <div key={step.id} id={`step-${step.id}`} className="scroll-mt-28">
            <Card>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>步骤 {idx + 1}</Badge>
                <h2 className="font-display text-xl font-semibold">{step.title}</h2>
              </div>
              <div className="prose-guide">
                <p>{step.body}</p>
              </div>
              {step.tip ? (
                <div className="mt-3 rounded-xl bg-brand-tint px-4 py-3 text-sm text-brand-strong">
                  提示：{step.tip}
                </div>
              ) : null}
              {step.sourceUrl || step.sourceNote ? (
                <div className="mt-3 text-sm text-ink-soft">
                  来源：
                  {step.sourceUrl ? (
                    <a
                      href={step.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 font-medium text-brand-strong underline-offset-2 hover:underline"
                    >
                      {step.sourceNote || step.sourceUrl}
                    </a>
                  ) : (
                    <span className="ml-1">{step.sourceNote}</span>
                  )}
                </div>
              ) : null}
            </Card>
          </div>
        ))}

        {faqs.length ? (
          <Card>
            <h2 className="font-display text-2xl font-semibold">常见问题</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.id} className="rounded-xl border border-border bg-bg px-4 py-3">
                  <summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary>
                  <p className="mt-2 text-sm text-ink-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
