"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

type NavItem = { id: string; label: string; href: string; order: number; visible: boolean };
type EntryCard = {
  id: string;
  platform: string;
  title: string;
  description: string;
  href: string;
  order: number;
  visible: boolean;
};

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    siteName: "",
    tagline: "",
    homeTitle: "",
    homeDescription: "",
    announcement: "",
    footerText: "",
  });
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [entryCards, setEntryCards] = useState<EntryCard[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "加载失败");
        setForm({
          siteName: data.settings.siteName || "",
          tagline: data.settings.tagline || "",
          homeTitle: data.settings.homeTitle || "",
          homeDescription: data.settings.homeDescription || "",
          announcement: data.settings.announcement || "",
          footerText: data.settings.footerText || "",
        });
        setNavItems(data.navItems);
        setEntryCards(data.entryCards);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, navItems, entryCards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setMessage("已保存并可用于前台展示");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card>加载中…</Card>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">首页与导航</h1>
          <p className="text-sm text-ink-muted">编辑网站名称、首页文案、导航与入口卡片</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="btn btn-secondary !w-auto">
            前台预览
          </a>
          <Button onClick={save} disabled={saving}>
            {saving ? "保存中…" : "保存发布"}
          </Button>
        </div>
      </div>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <Field label="网站名称">
          <input className="input" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        </Field>
        <Field label="标语">
          <input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </Field>
        <Field label="首页标题">
          <input className="input" value={form.homeTitle} onChange={(e) => setForm({ ...form, homeTitle: e.target.value })} />
        </Field>
        <Field label="首页说明">
          <textarea className="textarea" value={form.homeDescription} onChange={(e) => setForm({ ...form, homeDescription: e.target.value })} />
        </Field>
        <Field label="公告">
          <textarea className="textarea" value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} />
        </Field>
        <Field label="页脚文案">
          <textarea className="textarea" value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} />
        </Field>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold">导航项</h2>
        <div className="mt-4 space-y-3">
          {navItems.map((nav, idx) => (
            <div key={nav.id} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-4">
              <input className="input" value={nav.label} onChange={(e) => {
                const next = [...navItems];
                next[idx] = { ...nav, label: e.target.value };
                setNavItems(next);
              }} />
              <input className="input" value={nav.href} onChange={(e) => {
                const next = [...navItems];
                next[idx] = { ...nav, href: e.target.value };
                setNavItems(next);
              }} />
              <input className="input" type="number" value={nav.order} onChange={(e) => {
                const next = [...navItems];
                next[idx] = { ...nav, order: Number(e.target.value) };
                setNavItems(next);
              }} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={nav.visible} onChange={(e) => {
                  const next = [...navItems];
                  next[idx] = { ...nav, visible: e.target.checked };
                  setNavItems(next);
                }} />
                显示
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card orange>
        <h2 className="font-display text-xl font-semibold">入口卡片</h2>
        <div className="mt-4 space-y-3">
          {entryCards.map((card, idx) => (
            <div key={card.id} className="space-y-2 rounded-xl border border-border bg-white p-3">
              <div className="text-xs text-ink-soft">平台：{card.platform}</div>
              <input className="input" value={card.title} onChange={(e) => {
                const next = [...entryCards];
                next[idx] = { ...card, title: e.target.value };
                setEntryCards(next);
              }} />
              <textarea className="textarea" value={card.description} onChange={(e) => {
                const next = [...entryCards];
                next[idx] = { ...card, description: e.target.value };
                setEntryCards(next);
              }} />
              <div className="grid gap-2 md:grid-cols-3">
                <input className="input" value={card.href} onChange={(e) => {
                  const next = [...entryCards];
                  next[idx] = { ...card, href: e.target.value };
                  setEntryCards(next);
                }} />
                <input className="input" type="number" value={card.order} onChange={(e) => {
                  const next = [...entryCards];
                  next[idx] = { ...card, order: Number(e.target.value) };
                  setEntryCards(next);
                }} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={card.visible} onChange={(e) => {
                    const next = [...entryCards];
                    next[idx] = { ...card, visible: e.target.checked };
                    setEntryCards(next);
                  }} />
                  显示
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
