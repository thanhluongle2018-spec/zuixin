"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "EDITOR",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "无权限或加载失败");
    setUsers(data.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "创建失败");
    setMessage(`已创建 ${data.user.email}`);
    setForm({ email: "", name: "", password: "", role: "EDITOR" });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">后台账号</h1>
        <p className="text-sm text-ink-muted">区分管理员与编辑者；密码仅存哈希，不提供明文读取</p>
      </div>

      <Alert tone="warning" title="安全要求">
        不得保存或展示用户账号密码、验证码或恢复码。创建账号需要管理员权限。
      </Alert>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <h2 className="font-display text-xl font-semibold">创建账号</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="邮箱">
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="显示名">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="初始密码（至少 12 位）">
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="角色">
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="EDITOR">编辑者</option>
              <option value="ADMIN">管理员</option>
            </select>
          </Field>
        </div>
        <Button onClick={create}>创建</Button>
      </Card>

      <Card orange>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge>{u.role === "ADMIN" ? "管理员" : "编辑者"}</Badge>
                  </td>
                  <td>{formatDateTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
