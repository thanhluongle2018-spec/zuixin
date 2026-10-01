"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type NavItem = { id: string; label: string; href: string };
type LogoInfo = { path: string; altText: string } | null;

export function SiteHeader({
  siteName,
  logo,
  logoAlt,
  navItems,
  demoMode,
}: {
  siteName: string;
  logo: LogoInfo;
  logoAlt: string;
  navItems: NavItem[];
  demoMode: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[#fff7ed]/90 backdrop-blur-md">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {logo ? (
            <Image
              src={logo.path}
              alt={logo.altText || logoAlt}
              width={44}
              height={44}
              className="h-10 w-10 rounded-xl object-contain md:h-11 md:w-11"
              priority
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
              指
            </span>
          )}
          <span className="font-display text-lg font-semibold text-ink md:text-xl">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-brand-tint hover:text-brand-strong"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="btn btn-secondary btn-inline-mobile ml-2 !min-h-10 !px-4 !text-sm">
            管理后台
          </Link>
        </nav>

        <button
          type="button"
          className="btn btn-secondary !w-auto lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">菜单</span>
        </button>
      </div>

      {demoMode ? (
        <div className="border-t border-border bg-[#ffedd5] px-4 py-2 text-center text-xs font-medium text-[#9a3412] md:text-sm">
          演示模式：订单付款与接码均为模拟流程，不会产生真实扣款或真实验证码
        </div>
      ) : null}

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="移动导航">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-brand-tint"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="rounded-xl px-3 py-3 text-base font-medium text-brand-strong hover:bg-brand-tint"
              onClick={() => setOpen(false)}
            >
              管理后台
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
