import { SmsDemoClient } from "@/components/site/SmsDemoClient";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { getSmsMode, listDemoNumbers } from "@/lib/sms/provider";

export default async function SmsDemoPage() {
  const [config, numbers, mode] = await Promise.all([
    prisma.smsProviderConfig.findUnique({ where: { id: "default" } }),
    listDemoNumbers(),
    getSmsMode(),
  ]);

  return (
    <div className="container-page section space-y-6">
      <Card orange>
        <Badge>接码演示</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">接码接口演示</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          当前模式：{mode === "demo" ? "演示" : "预留真实"}。
          {config?.note || "演示模式，未连接真实服务。"}
        </p>
      </Card>

      <SmsDemoClient
        initialNumbers={numbers}
        modeNote={config?.note || "演示模式，未连接真实服务。未取得服务商授权及正式 API 文档前，不会发起真实下单或读取验证码。"}
      />
    </div>
  );
}
