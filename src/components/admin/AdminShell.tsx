"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  Image,
  BookOpen,
  Package,
  Tags,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Settings,
  Users,
  ScrollText,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/home", label: "首页与导航", icon: Home },
  { href: "/admin/logos", label: "Logo 管理", icon: Image },
  { href: "/admin/tutorials", label: "教程内容", icon: BookOpen },
  { href: "/admin/services", label: "服务目录", icon: Package },
  { href: "/admin/pricing", label: "价格管理", icon: Tags },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingCart },
  { href: "/admin/payments", label: "付款设置", icon: CreditCard },
  { href: "/admin/sms", label: "接码设置", icon: Smartphone },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
  { href: "/admin/users", label: "账号与审计", icon: Users },
  { href: "/admin/audit", label: "审计日志", icon: ScrollText },
];

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const Nav = (
    <nav className="space-y-1" aria-label="后台导航">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-brand text-white shadow-soft"
                : "text-ink-muted hover:bg-brand-tint hover:text-brand-strong"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <div className="border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-secondary !w-auto lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="打开菜单"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <div className="font-display text-lg font-semibold">管理后台</div>
              <div className="text-xs text-ink-soft">
                {user.name} · {user.role === "ADMIN" ? "管理员" : "编辑者"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-secondary !w-auto !min-h-10 !px-3 !text-sm">
              查看前台
            </Link>
            <button
              type="button"
              onClick={logout}
              className="btn btn-ghost !w-auto !min-h-10 !px-3 !text-sm"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-6 !p-3">{Nav}</div>
        </aside>
        {open ? <div className="card !p-3 lg:hidden">{Nav}</div> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
