import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMoney(amount: number, currency = "CNY") {
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "待处理",
    PROCESSING: "处理中",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return map[status] || status;
}

export function paymentStatusLabel(status: string) {
  const map: Record<string, string> = {
    UNPAID: "未付款",
    PENDING: "付款中",
    PAID: "已付款（模拟）",
    FAILED: "付款失败",
    REFUNDED: "已退款",
  };
  return map[status] || status;
}

export function contentStatusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "草稿",
    PUBLISHED: "已发布",
    ARCHIVED: "已下架",
  };
  return map[status] || status;
}

export function generateOrderNo() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `DEMO-${stamp}-${rand}`;
}
