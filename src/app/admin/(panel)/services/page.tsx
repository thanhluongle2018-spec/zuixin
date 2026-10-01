"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  notes?: string | null;
  status: string;
  available: boolean;
  order: number;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "加载失败");
    setServices(data.services);
    if (selected) {
      setSelected(data.services.find((s: Service) => s.id === selected.id) || data.services[0] || null);
    } else {
      setSelected(data.services[0] || null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "新服务", category: "其他", description: "", status: "DRAFT" }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "创建失败");
    await load();
    setSelected(data.item);
  }

  async function save() {
    if (!selected) return;
    const res = await fetch("/api/admin/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "保存失败");
    setMessage("已保存");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">服务目录管理</h1>
          <p className="text-sm text-ink-muted">编辑服务名称、类别、描述、注意事项、状态与排序</p>
        </div>
        <Button onClick={create}>新增服务</Button>
      </div>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="!p-3">
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`w-full rounded-xl px-3 py-3 text-left ${selected?.id === s.id ? "bg-brand text-white" : "bg-bg"}`}
                onClick={() => setSelected(s)}
              >
                <div className="font-medium">{s.name}</div>
                <div className="mt-1 text-xs opacity-80">{s.category}</div>
              </button>
            ))}
          </div>
        </Card>

        {selected ? (
          <Card>
            <div className="mb-3 flex gap-2">
              <Badge>{selected.status}</Badge>
              <Badge tone={selected.available ? "success" : "warning"}>
                {selected.available ? "可用" : "不可用"}
              </Badge>
            </div>
            <Field label="名称">
              <input className="input" value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
            </Field>
            <Field label="类别">
              <input className="input" value={selected.category} onChange={(e) => setSelected({ ...selected, category: e.target.value })} />
            </Field>
            <Field label="描述">
              <textarea className="textarea" value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })} />
            </Field>
            <Field label="注意事项">
              <textarea className="textarea" value={selected.notes || ""} onChange={(e) => setSelected({ ...selected, notes: e.target.value })} />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="状态">
                <select className="select" value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
                  <option value="DRAFT">草稿</option>
                  <option value="PUBLISHED">已发布</option>
                  <option value="ARCHIVED">已下架</option>
                </select>
              </Field>
              <Field label="排序">
                <input className="input" type="number" value={selected.order} onChange={(e) => setSelected({ ...selected, order: Number(e.target.value) })} />
              </Field>
              <label className="mt-7 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.available} onChange={(e) => setSelected({ ...selected, available: e.target.checked })} />
                可用
              </label>
            </div>
            <Button onClick={save}>保存</Button>
          </Card>
        ) : (
          <Card>暂无服务</Card>
        )}
      </div>
    </div>
  );
}
