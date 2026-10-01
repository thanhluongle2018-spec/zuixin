/**
 * 支付适配层
 * 未配置真实支付服务商时，仅支持明确标记的模拟付款。
 * 真实接入需按官方文档实现下单与服务端回调验签。
 */

export type DemoPayResult = {
  success: true;
  mode: "demo";
  message: string;
  paidAt: string;
};

export function getPaymentProvider() {
  return process.env.PAYMENT_PROVIDER || "";
}

export function isLivePaymentConfigured() {
  return Boolean(
    process.env.PAYMENT_PROVIDER &&
      process.env.PAYMENT_API_KEY &&
      process.env.PAYMENT_WEBHOOK_SECRET
  );
}

export async function processDemoPayment(): Promise<DemoPayResult> {
  return {
    success: true,
    mode: "demo",
    message: "模拟付款成功（演示模式，未产生真实扣款）",
    paidAt: new Date().toISOString(),
  };
}

export async function verifyLiveWebhook(..._args: [string, string]): Promise<never> {
  void _args;
  throw new Error(
    "真实支付回调验签尚未配置。请根据支付服务商官方文档实现验签逻辑。"
  );
}
