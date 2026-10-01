"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";

type Logo = {
  id: string;
  path: string;
  filename: string;
  altText: string;
  isDefault: boolean;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
  updatedBy?: { name: string } | null;
};

export default function AdminLogosPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);
  const [altText, setAltText] = useState("网站 Logo");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setLogos(data.logos);
      setActiveLogoId(data.settings?.activeLogoId || null);
      setAltText(data.settings?.logoAlt || "网站 Logo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function upload() {
    if (!file) {
      setError("请选择图片文件");
      return;
    }
    setError(null);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("altText", altText);
    const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "上传失败");
      return;
    }
    setFile(null);
    setMessage("上传成功，可预览并启用");
    await load();
  }

  async function activate(id: string) {
    if (!confirm("确认将此前台启用此 Logo？")) return;
    const res = await fetch("/api/upload/logo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoId: id, activate: true, altText }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "启用失败");
      return;
    }
    setMessage("已切换当前 Logo");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("移除前将自动切回默认/其他 Logo。确认移除？")) return;
    const res = await fetch("/api/upload/logo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoId: id, remove: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "移除失败");
      return;
    }
    setMessage("已移除");
    await load();
  }

  if (loading) return <Card>加载中…</Card>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Logo 管理</h1>
        <p className="text-sm text-ink-muted">上传、预览、启用与移除网站 Logo，变更写入数据层</p>
      </div>

      <Alert tone="info" title="规范">
        支持 PNG / JPEG / WebP / GIF / SVG，单文件不超过 2MB。前台导航与页脚统一读取站点设置中的当前 Logo。
      </Alert>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <Field label="替代文字">
          <input className="input" value={altText} onChange={(e) => setAltText(e.target.value)} />
        </Field>
        <Field label="上传新 Logo" hint="请选择图片文件">
          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Field>
        <Button onClick={upload}>上传</Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {logos.map((logo) => (
          <Card key={logo.id} orange={logo.id === activeLogoId}>
            <div className="flex h-28 items-center justify-center rounded-xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.path}
                alt={logo.altText}
                width={96}
                height={96}
                className="max-h-24 w-auto object-contain"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {logo.id === activeLogoId ? <Badge tone="success">当前启用</Badge> : null}
              {logo.isDefault ? <Badge>默认</Badge> : null}
            </div>
            <div className="mt-2 text-sm font-medium">{logo.filename}</div>
            <div className="text-xs text-ink-soft">
              {(logo.sizeBytes / 1024).toFixed(1)} KB · {logo.mimeType}
            </div>
            <div className="mt-1 text-xs text-ink-soft">
              更新：{formatDateTime(logo.updatedAt)}
              {logo.updatedBy ? ` · ${logo.updatedBy.name}` : ""}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={() => activate(logo.id)} disabled={logo.id === activeLogoId}>
                启用此 Logo
              </Button>
              <Button variant="danger" onClick={() => remove(logo.id)} disabled={logo.isDefault}>
                移除
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
