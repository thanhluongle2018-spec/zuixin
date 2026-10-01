"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  body: string;
  tip?: string | null;
  sourceUrl?: string | null;
  sourceNote?: string | null;
  order: number;
};

type Tutorial = {
  id: string;
  title: string;
  slug: string;
  platform: string;
  summary: string;
  readingMinutes: number;
  status: string;
  order: number;
  sourceNote?: string | null;
  updatedAt: string;
  steps: Step[];
  faqs: Array<{ id: string; question: string; answer: string; order: number }>;
};

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = tutorials.find((t) => t.id === selectedId) || null;

  async function load() {
    const res = await fetch("/api/admin/tutorials");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "加载失败");
      return;
    }
    setTutorials(data.tutorials);
    if (!selectedId && data.tutorials[0]) setSelectedId(data.tutorials[0].id);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSelected(patch: Partial<Tutorial>) {
    if (!selected) return;
    setTutorials((prev) => prev.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)));
  }

  async function save(status?: string) {
    if (!selected) return;
    setMessage(null);
    setError(null);
    const payload = { ...selected, status: status || selected.status };
    const res = await fetch("/api/admin/tutorials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "保存失败");
      return;
    }
    setMessage(status === "PUBLISHED" ? "已发布" : status === "ARCHIVED" ? "已下架" : "草稿已保存");
    await load();
  }

  async function createTutorial() {
    const res = await fetch("/api/admin/tutorials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "新教程",
        summary: "请编辑摘要",
        platform: "general",
        status: "DRAFT",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    await load();
    setSelectedId(data.item.id);
  }

  async function addStep() {
    if (!selected) return;
    const res = await fetch("/api/admin/tutorial-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tutorialId: selected.id,
        title: "新步骤",
        body: "请填写内容",
        order: selected.steps.length,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "添加失败");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">教程内容管理</h1>
          <p className="text-sm text-ink-muted">新增、编辑、排序、草稿/发布/下架</p>
        </div>
        <Button onClick={createTutorial}>新增教程</Button>
      </div>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="!p-3">
          <div className="space-y-2">
            {tutorials.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full rounded-xl px-3 py-3 text-left ${
                  selectedId === t.id ? "bg-brand text-white" : "bg-bg hover:bg-brand-tint"
                }`}
              >
                <div className="font-medium">{t.title}</div>
                <div className={`mt-1 text-xs ${selectedId === t.id ? "text-white/80" : "text-ink-soft"}`}>
                  {t.platform} · {t.status}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {selected ? (
          <Card>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{selected.status}</Badge>
              <Badge tone="info">更新 {formatDateTime(selected.updatedAt)}</Badge>
            </div>
            <Field label="标题">
              <input className="input" value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Slug">
                <input className="input" value={selected.slug} onChange={(e) => updateSelected({ slug: e.target.value })} />
              </Field>
              <Field label="平台">
                <select className="select" value={selected.platform} onChange={(e) => updateSelected({ platform: e.target.value })}>
                  <option value="ios">ios</option>
                  <option value="android">android</option>
                  <option value="general">general</option>
                </select>
              </Field>
              <Field label="排序">
                <input className="input" type="number" value={selected.order} onChange={(e) => updateSelected({ order: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="摘要">
              <textarea className="textarea" value={selected.summary} onChange={(e) => updateSelected({ summary: e.target.value })} />
            </Field>
            <Field label="预计阅读分钟">
              <input className="input" type="number" value={selected.readingMinutes} onChange={(e) => updateSelected({ readingMinutes: Number(e.target.value) })} />
            </Field>

            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">步骤</h2>
              <Button variant="secondary" onClick={addStep}>
                添加步骤
              </Button>
            </div>
            <div className="space-y-3">
              {selected.steps.map((step, idx) => (
                <div key={step.id} className="rounded-xl border border-border bg-bg p-3">
                  <Field label={`步骤 ${idx + 1} 标题`}>
                    <input
                      className="input"
                      value={step.title}
                      onChange={(e) => {
                        const steps = [...selected.steps];
                        steps[idx] = { ...step, title: e.target.value };
                        updateSelected({ steps });
                      }}
                    />
                  </Field>
                  <Field label="正文">
                    <textarea
                      className="textarea"
                      value={step.body}
                      onChange={(e) => {
                        const steps = [...selected.steps];
                        steps[idx] = { ...step, body: e.target.value };
                        updateSelected({ steps });
                      }}
                    />
                  </Field>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field label="提示">
                      <input
                        className="input"
                        value={step.tip || ""}
                        onChange={(e) => {
                          const steps = [...selected.steps];
                          steps[idx] = { ...step, tip: e.target.value };
                          updateSelected({ steps });
                        }}
                      />
                    </Field>
                    <Field label="排序">
                      <input
                        className="input"
                        type="number"
                        value={step.order}
                        onChange={(e) => {
                          const steps = [...selected.steps];
                          steps[idx] = { ...step, order: Number(e.target.value) };
                          updateSelected({ steps });
                        }}
                      />
                    </Field>
                  </div>
                  <Field label="来源链接（未核实请留空并在备注写 TODO）">
                    <input
                      className="input"
                      value={step.sourceUrl || ""}
                      onChange={(e) => {
                        const steps = [...selected.steps];
                        steps[idx] = { ...step, sourceUrl: e.target.value };
                        updateSelected({ steps });
                      }}
                    />
                  </Field>
                  <Field label="来源说明">
                    <input
                      className="input"
                      value={step.sourceNote || ""}
                      onChange={(e) => {
                        const steps = [...selected.steps];
                        steps[idx] = { ...step, sourceNote: e.target.value };
                        updateSelected({ steps });
                      }}
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => save("DRAFT")}>
                保存草稿
              </Button>
              <Button onClick={() => save("PUBLISHED")}>发布</Button>
              <Button variant="danger" onClick={() => save("ARCHIVED")}>
                下架
              </Button>
              <a
                className="btn btn-ghost !w-auto"
                href={selected.platform === "android" ? "/android" : selected.platform === "ios" ? "/ios" : "/"}
                target="_blank"
                rel="noreferrer"
              >
                前台预览
              </a>
            </div>
          </Card>
        ) : (
          <Card>请选择教程</Card>
        )}
      </div>
    </div>
  );
}
