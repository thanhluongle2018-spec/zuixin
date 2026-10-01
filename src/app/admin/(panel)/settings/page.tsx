"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    siteName: "",
    contactEmail: "",
    contactWechat: "",
    disclaimer: "",
    privacyText: "",
    termsText: "",
    seoTitle: "",
    seoDescription: "",
    logoAlt: "",
    demoMode: true,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) return setError(data.error || "加载失败");
      const s = data.settings;
      setForm({
        siteName: s.siteName || "",
        contactEmail: s.contactEmail || "",
        contactWechat: s.contactWechat || "",
        disclaimer: s.disclaimer || "",
        privacyText: s.privacyText || "",
        termsText: s.termsText || "",
        seoTitle: s.seoTitle || "",
        seoDescription: s.seoDescription || "",
        logoAlt: s.logoAlt || "",
        demoMode: s.demoMode ?? true,
      });
    })();
  }, []);

  async function save() {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "保存失败");
    setMessage("站点设置已保存");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">站点设置</h1>
        <p className="text-sm text-ink-muted">品牌信息、联系方式、免责声明与 SEO</p>
      </div>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <Field label="网站名称">
          <input className="input" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="联系邮箱">
            <input className="input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </Field>
          <Field label="联系微信">
            <input className="input" value={form.contactWechat} onChange={(e) => setForm({ ...form, contactWechat: e.target.value })} />
          </Field>
        </div>
        <Field label="Logo 替代文字">
          <input className="input" value={form.logoAlt} onChange={(e) => setForm({ ...form, logoAlt: e.target.value })} />
        </Field>
        <Field label="SEO 标题">
          <input className="input" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
        </Field>
        <Field label="SEO 描述">
          <textarea className="textarea" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
        </Field>
        <Field label="隐私说明">
          <textarea className="textarea" value={form.privacyText} onChange={(e) => setForm({ ...form, privacyText: e.target.value })} />
        </Field>
        <Field label="服务条款">
          <textarea className="textarea" value={form.termsText} onChange={(e) => setForm({ ...form, termsText: e.target.value })} />
        </Field>
        <Field label="免责声明">
          <textarea className="textarea" value={form.disclaimer} onChange={(e) => setForm({ ...form, disclaimer: e.target.value })} />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.demoMode} onChange={(e) => setForm({ ...form, demoMode: e.target.checked })} />
          演示模式（前台显示演示提示）
        </label>
        <Button onClick={save}>保存</Button>
      </Card>
    </div>
  );
}
