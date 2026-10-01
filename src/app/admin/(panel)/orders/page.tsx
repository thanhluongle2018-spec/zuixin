"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import {
  formatDateTime,
  formatMoney,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/utils";

type Order = {
  id: string;
  orderNo: string;
  amount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  isDemo: boolean;
  customerNote?: string | null;
  createdAt: string;
  service: { name: string };
  paymentMethod?: { name: string } | null;
  pricePlan?: { name: string } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (payment) params.set("payment", payment);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error || "加载失败");
    setOrders(data.orders);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateOrder(order: Order) {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: order.id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "更新失败");
    setMessage("订单已更新");
    setDetail(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">订单管理</h1>
        <p className="text-sm text-ink-muted">搜索、筛选与查看演示订单详情</p>
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="搜索">
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="订单号/服务/备注" />
          </Field>
          <Field label="订单状态">
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">全部</option>
              <option value="PENDING">待处理</option>
              <option value="PROCESSING">处理中</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </Field>
          <Field label="付款状态">
            <select className="select" value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="">全部</option>
              <option value="UNPAID">未付款</option>
              <option value="PENDING">付款中</option>
              <option value="PAID">已付款</option>
              <option value="FAILED">失败</option>
            </select>
          </Field>
          <div className="flex items-end">
            <Button onClick={load}>筛选</Button>
          </div>
        </div>
      </Card>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Card>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>订单编号</th>
                <th>服务</th>
                <th>金额</th>
                <th>订单状态</th>
                <th>付款状态</th>
                <th>创建时间</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="font-medium">{o.orderNo}</div>
                    {o.isDemo ? <Badge tone="warning">测试数据</Badge> : null}
                  </td>
                  <td>{o.service.name}</td>
                  <td>{formatMoney(o.amount, o.currency)}</td>
                  <td><Badge tone="info">{orderStatusLabel(o.orderStatus)}</Badge></td>
                  <td><Badge tone={o.paymentStatus === "PAID" ? "success" : "warning"}>{paymentStatusLabel(o.paymentStatus)}</Badge></td>
                  <td>{formatDateTime(o.createdAt)}</td>
                  <td>
                    <Button variant="secondary" className="!min-h-9 !px-3 !text-sm" onClick={() => setDetail(o)}>
                      详情
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length ? <div className="empty-state">暂无订单</div> : null}
      </Card>

      {detail ? (
        <Card orange>
          <h2 className="font-display text-xl font-semibold">订单详情</h2>
          <p className="mt-2 text-sm text-ink-muted">编号：{detail.orderNo}</p>
          <p className="text-sm text-ink-muted">服务：{detail.service.name}</p>
          <p className="text-sm text-ink-muted">方案：{detail.pricePlan?.name || "—"}</p>
          <p className="text-sm text-ink-muted">付款方式：{detail.paymentMethod?.name || "—"}</p>
          <p className="text-sm text-ink-muted">备注：{detail.customerNote || "—"}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="订单状态">
              <select className="select" value={detail.orderStatus} onChange={(e) => setDetail({ ...detail, orderStatus: e.target.value })}>
                <option value="PENDING">待处理</option>
                <option value="PROCESSING">处理中</option>
                <option value="COMPLETED">已完成</option>
                <option value="CANCELLED">已取消</option>
              </select>
            </Field>
            <Field label="付款状态">
              <select className="select" value={detail.paymentStatus} onChange={(e) => setDetail({ ...detail, paymentStatus: e.target.value })}>
                <option value="UNPAID">未付款</option>
                <option value="PENDING">付款中</option>
                <option value="PAID">已付款（模拟）</option>
                <option value="FAILED">失败</option>
                <option value="REFUNDED">已退款</option>
              </select>
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => updateOrder(detail)}>保存</Button>
            <Button variant="ghost" onClick={() => setDetail(null)}>关闭</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
