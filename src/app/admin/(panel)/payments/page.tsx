"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

type Method = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  isDemo: boolean;
  order: number;
};

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "加载失败");
    setMethods(data.methods);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "新付款方式",
        description: "请填写说明。未接入真实支付前请保持演示标记。",
        enabled: false,
        isDemo: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "创建失败");
    await load();
  }

  async function save(method: Method) {
    const res = await fetch("/api/admin/payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(method),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "保存失败");
    setMessage("付款设置已更新");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">付款设置</h1>
          <p className="text-sm text-ink-muted">配置付款方式名称、说明、启用状态与展示顺序</p>
        </div>
        <Button onClick={create}>新增方式</Button>
      </div>

      <Alert tone="demo" title="演示模式">
        当前未接入真实支付渠道。请使用模拟付款，并明确标记为演示。真实接入需支付服务商官方文档与服务端回调验签。
      </Alert>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="space-y-4">
        {methods.map((m, idx) => (
          <Card key={m.id}>
            <div className="mb-3 flex gap-2">
              {m.isDemo ? <Badge tone="warning">演示</Badge> : <Badge tone="info">预留真实</Badge>}
              <Badge tone={m.enabled ? "success" : "warning"}>{m.enabled ? "启用" : "停用"}</Badge>
            </div>
            <Field label="名称">
              <input className="input" value={m.name} onChange={(e) => {
                const next = [...methods];
                next[idx] = { ...m, name: e.target.value };
                setMethods(next);
              }} />
            </Field>
            <Field label="说明">
              <textarea className="textarea" value={m.description} onChange={(e) => {
                const next = [...methods];
                next[idx] = { ...m, description: e.target.value };
                setMethods(next);
              }} />
            </Field>
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <Field label="排序">
                <input className="input" type="number" value={m.order} onChange={(e) => {
                  const next = [...methods];
                  next[idx] = { ...m, order: Number(e.target.value) };
                  setMethods(next);
                }} />
              </Field>
              <label className="mt-7 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.enabled} onChange={(e) => {
                  const next = [...methods];
                  next[idx] = { ...m, enabled: e.target.checked };
                  setMethods(next);
                }} />
                启用
              </label>
              <label className="mt-7 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.isDemo} onChange={(e) => {
                  const next = [...methods];
                  next[idx] = { ...m, isDemo: e.target.checked };
                  setMethods(next);
                }} />
                演示模式标记
              </label>
            </div>
            <Button onClick={() => save(methods[idx])}>保存</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
