"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { formatDateTime, formatMoney } from "@/lib/utils";

type Price = {
  id: string;
  serviceId: string;
  name: string;
  amount: number;
  currency: string;
  unit: string;
  description?: string | null;
  enabled: boolean;
  order: number;
  updatedAt: string;
  service?: { name: string };
  updatedBy?: { name: string } | null;
};

type Service = { id: string; name: string };

export default function AdminPricingPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    serviceId: "",
    name: "",
    amount: 0,
    currency: "CNY",
    unit: "次",
    description: "",
    enabled: true,
    order: 0,
  });
  const [editing, setEditing] = useState<Price | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/pricing");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "加载失败");
    setPrices(data.prices);
    setServices(data.services);
    if (!form.serviceId && data.services[0]) {
      setForm((f) => ({ ...f, serviceId: data.services[0].id }));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "创建失败");
    setMessage("已新增价格方案");
    setForm({ ...form, name: "", amount: 0, description: "" });
    await load();
  }

  async function saveEdit() {
    if (!editing) return;
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "保存失败");
    setMessage("价格已更新");
    setEditing(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">价格管理</h1>
        <p className="text-sm text-ink-muted">管理价格方案、单位、币种、说明与启用状态</p>
      </div>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <h2 className="font-display text-xl font-semibold">新增价格方案</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="服务">
            <select className="select" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="方案名称">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="价格">
            <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </Field>
          <Field label="币种">
            <input className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </Field>
          <Field label="计价单位">
            <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </Field>
          <Field label="排序">
            <input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="价格说明">
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          启用
        </label>
        <Button onClick={create}>新增</Button>
      </Card>

      <Card orange>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>服务</th>
                <th>方案</th>
                <th>价格</th>
                <th>状态</th>
                <th>更新</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p.id}>
                  <td>{p.service?.name}</td>
                  <td>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-ink-soft">/{p.unit}</div>
                  </td>
                  <td>{formatMoney(p.amount, p.currency)}</td>
                  <td>
                    <Badge tone={p.enabled ? "success" : "warning"}>{p.enabled ? "启用" : "停用"}</Badge>
                  </td>
                  <td className="text-xs">
                    {formatDateTime(p.updatedAt)}
                    {p.updatedBy ? ` · ${p.updatedBy.name}` : ""}
                  </td>
                  <td>
                    <Button variant="secondary" className="!min-h-9 !px-3 !text-sm" onClick={() => setEditing(p)}>
                      编辑
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing ? (
        <Card>
          <h2 className="font-display text-xl font-semibold">编辑价格</h2>
          <Field label="名称">
            <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="金额">
              <input className="input" type="number" step="0.01" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} />
            </Field>
            <Field label="币种">
              <input className="input" value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} />
            </Field>
            <Field label="单位">
              <input className="input" value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} />
            </Field>
          </div>
          <Field label="说明">
            <textarea className="textarea" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
            启用
          </label>
          <div className="flex gap-2">
            <Button onClick={saveEdit}>保存</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>取消</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
