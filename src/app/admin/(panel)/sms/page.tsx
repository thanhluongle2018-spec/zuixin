"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

export default function AdminSmsPage() {
  const [form, setForm] = useState({
    displayName: "演示接码",
    note: "",
    enabled: true,
    mode: "demo",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/sms");
      const data = await res.json();
      if (!res.ok) return setError(data.error || "加载失败");
      setForm({
        displayName: data.config.displayName,
        note: data.config.note,
        enabled: data.config.enabled,
        mode: data.config.mode,
      });
    })();
  }, []);

  async function save() {
    const res = await fetch("/api/admin/sms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "保存失败");
    setMessage("已保存（强制保持演示模式，直至真实适配层启用）");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">接码接口设置</h1>
        <p className="text-sm text-ink-muted">默认演示模式，预留服务端 API 适配层与环境变量</p>
      </div>

      <Alert tone="demo" title="演示模式，未连接真实服务">
        未取得服务商授权及正式 API 文档前，不会发起真实下单或读取验证码。密钥请放入 SMS_PROVIDER_API_KEY / SMS_PROVIDER_API_URL 环境变量。
      </Alert>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <Field label="显示名称">
          <input className="input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </Field>
        <Field label="模式">
          <input className="input" value="demo（强制）" disabled />
        </Field>
        <Field label="说明文案">
          <textarea className="textarea" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          启用演示接码入口
        </label>
        <Button onClick={save}>保存</Button>
      </Card>
    </div>
  );
}
