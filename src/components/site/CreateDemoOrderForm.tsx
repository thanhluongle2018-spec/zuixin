"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { formatMoney } from "@/lib/utils";

type ServiceOption = {
  id: string;
  name: string;
  prices: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    unit: string;
  }>;
};

type MethodOption = {
  id: string;
  name: string;
  description: string;
  isDemo: boolean;
};

export function CreateDemoOrderForm({
  services,
  methods,
}: {
  services: ServiceOption[];
  methods: MethodOption[];
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );
  const [priceId, setPriceId] = useState(selectedService?.prices[0]?.id || "");
  const [methodId, setMethodId] = useState(methods[0]?.id || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const onServiceChange = (id: string) => {
    setServiceId(id);
    const svc = services.find((s) => s.id === id);
    setPriceId(svc?.prices[0]?.id || "");
  };

  async function createOrder() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          pricePlanId: priceId || null,
          paymentMethodId: methodId || null,
          customerNote: note || "【测试数据】前台演示下单",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建失败");
      setCreatedOrderId(data.order.id);
      setMessage(`已创建演示订单 ${data.order.orderNo}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setLoading(false);
    }
  }

  async function demoPay() {
    if (!createdOrderId) {
      setError("请先创建演示订单");
      return;
    }
    setPayLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${createdOrderId}/demo-pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "模拟付款失败");
      setMessage(data.message || "模拟付款完成");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "模拟付款失败");
    } finally {
      setPayLoading(false);
    }
  }

  const selectedPrice = selectedService?.prices.find((p) => p.id === priceId);

  return (
    <Card>
      <h2 className="font-display text-xl font-semibold">创建演示订单</h2>
      <p className="mt-1 text-sm text-ink-muted">仅用于展示流程，订单会标记为测试数据。</p>

      <div className="mt-4">
        <Field label="选择服务" htmlFor="service">
          <select
            id="service"
            className="select"
            value={serviceId}
            onChange={(e) => onServiceChange(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="价格方案" htmlFor="price">
          <select
            id="price"
            className="select"
            value={priceId}
            onChange={(e) => setPriceId(e.target.value)}
          >
            {(selectedService?.prices || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatMoney(p.amount, p.currency)} / {p.unit}
              </option>
            ))}
          </select>
        </Field>

        <Field label="付款方式" htmlFor="method">
          <select
            id="method"
            className="select"
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
          >
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.isDemo ? "（演示）" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="备注（可选）" htmlFor="note">
          <textarea
            id="note"
            className="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：演示用途"
          />
        </Field>
      </div>

      {selectedPrice ? (
        <Alert tone="info" title="当前金额">
          {formatMoney(selectedPrice.amount, selectedPrice.currency)}（演示价格）
        </Alert>
      ) : null}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button onClick={createOrder} disabled={loading || !serviceId}>
          {loading ? "创建中…" : "创建演示订单"}
        </Button>
        <Button variant="secondary" onClick={demoPay} disabled={payLoading || !createdOrderId}>
          {payLoading ? "处理中…" : "模拟付款"}
        </Button>
      </div>
    </Card>
  );
}
