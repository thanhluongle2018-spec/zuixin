/**
 * 接码服务适配层
 * 默认 demo 模式，不发起真实请求。
 * 真实接入前需：服务商授权、正式 API 文档、服务条款，并配置环境变量。
 */

export type SmsNumber = {
  id: string;
  country: string;
  number: string;
  service: string;
  isDemo: true;
};

export type SmsMessage = {
  id: string;
  numberId: string;
  preview: string;
  receivedAt: string;
  isDemo: true;
  note: string;
};

const DEMO_NUMBERS: SmsNumber[] = [
  {
    id: "demo-num-1",
    country: "US",
    number: "+1 (555) 010-2001",
    service: "通用演示",
    isDemo: true,
  },
  {
    id: "demo-num-2",
    country: "GB",
    number: "+44 7700 900123",
    service: "通用演示",
    isDemo: true,
  },
];

export async function getSmsMode(): Promise<"demo" | "live"> {
  const hasKey = Boolean(process.env.SMS_PROVIDER_API_KEY);
  const hasUrl = Boolean(process.env.SMS_PROVIDER_API_URL);
  // 即使配置了环境变量，在未实现正式适配前仍强制 demo，避免误请求
  if (hasKey && hasUrl) {
    // 预留：未来可返回 "live"
    return "demo";
  }
  return "demo";
}

export async function listDemoNumbers(): Promise<SmsNumber[]> {
  return DEMO_NUMBERS;
}

export async function rentDemoNumber(serviceLabel: string): Promise<SmsNumber> {
  return {
    id: `demo-rent-${Date.now()}`,
    country: "US",
    number: "+1 (555) 014-" + String(Math.floor(Math.random() * 9000 + 1000)),
    service: serviceLabel || "通用演示",
    isDemo: true,
  };
}

export async function listDemoMessages(numberId: string): Promise<SmsMessage[]> {
  return [
    {
      id: `demo-msg-${numberId}-1`,
      numberId,
      preview: "【演示】您的验证码是 000000（模拟数据，非真实验证码）",
      receivedAt: new Date().toISOString(),
      isDemo: true,
      note: "演示模式，未连接真实服务。系统不会保存用户真实验证码。",
    },
  ];
}

/** 真实适配入口占位：未授权前禁止调用 */
export async function liveProviderRequest(..._args: [string, unknown?]): Promise<never> {
  void _args;
  throw new Error(
    "真实接码 API 尚未启用。请先完成服务商授权、API 文档确认，并实现适配层后再切换 live 模式。"
  );
}
