"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card orange className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold">管理后台登录</h1>
        <p className="mt-2 text-sm text-ink-muted">
          仅管理员与编辑者可访问。密码以安全哈希存储，系统不提供明文读取。
        </p>
        <Alert className="mt-4" tone="demo" title="首次使用">
          请通过环境变量 BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD 运行{" "}
          <code>npm run db:seed</code> 创建首个管理员，勿在代码中硬编码密码。
        </Alert>
        <form className="mt-5" onSubmit={onSubmit}>
          <Field label="邮箱" htmlFor="email">
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="密码" htmlFor="password">
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "登录中…" : "登录"}
          </Button>
        </form>
        <Link href="/" className="mt-4 inline-block text-sm text-brand-strong">
          返回前台
        </Link>
      </Card>
    </div>
  );
}
