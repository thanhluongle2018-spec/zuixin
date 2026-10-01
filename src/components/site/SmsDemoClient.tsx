"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

type DemoNumber = {
  id: string;
  country: string;
  number: string;
  service: string;
  isDemo: true;
};

type DemoMessage = {
  id: string;
  preview: string;
  receivedAt: string;
  note: string;
};

export function SmsDemoClient({
  initialNumbers,
  modeNote,
}: {
  initialNumbers: DemoNumber[];
  modeNote: string;
}) {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [service, setService] = useState("通用演示");
  const [selectedId, setSelectedId] = useState(initialNumbers[0]?.id || "");
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rentNumber() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sms/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "获取失败");
      setNumbers((prev) => [data.number, ...prev]);
      setSelectedId(data.number.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sms/messages?numberId=${encodeURIComponent(selectedId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "读取失败");
      setMessages(data.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "读取失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Alert tone="demo" title="演示模式，未连接真实服务">
        {modeNote}
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold">获取演示号码</h2>
          <Field label="服务标签" htmlFor="svc" className="mt-4">
            <input
              id="svc"
              className="input"
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </Field>
          <Button onClick={rentNumber} disabled={loading}>
            {loading ? "处理中…" : "获取演示号码"}
          </Button>
          <div className="mt-4 space-y-2">
            {numbers.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelectedId(n.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left ${
                  selectedId === n.id
                    ? "border-brand bg-brand-tint"
                    : "border-border bg-white hover:border-brand"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{n.number}</span>
                  <Badge>演示</Badge>
                </div>
                <div className="mt-1 text-xs text-ink-soft">
                  {n.country} · {n.service}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card orange>
          <h2 className="font-display text-xl font-semibold">查看演示短信</h2>
          <p className="mt-2 text-sm text-ink-muted">
            系统不会保存或展示用户真实账号密码、验证码或恢复码。以下内容为模拟数据。
          </p>
          <Button className="mt-4" variant="secondary" onClick={loadMessages} disabled={loading || !selectedId}>
            读取演示短信
          </Button>
          <div className="mt-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-white px-4 py-3">
                <div className="text-sm font-medium">{m.preview}</div>
                <div className="mt-1 text-xs text-ink-soft">{new Date(m.receivedAt).toLocaleString("zh-CN")}</div>
                <div className="mt-2 text-xs text-warning">{m.note}</div>
              </div>
            ))}
            {!messages.length ? (
              <p className="text-sm text-ink-soft">尚未加载演示短信</p>
            ) : null}
          </div>
        </Card>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
