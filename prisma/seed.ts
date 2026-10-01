import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin is created only via BOOTSTRAP_ADMIN_* env vars — never hardcode passwords.
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const bootstrapName = process.env.BOOTSTRAP_ADMIN_NAME || "站点管理员";

  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (!admin && bootstrapEmail && bootstrapPassword) {
    if (bootstrapPassword.length < 12) {
      throw new Error("BOOTSTRAP_ADMIN_PASSWORD 长度至少 12 位");
    }
    admin = await prisma.user.create({
      data: {
        email: bootstrapEmail,
        name: bootstrapName,
        passwordHash: await bcrypt.hash(bootstrapPassword, 12),
        role: "ADMIN",
      },
    });
    console.log(`已创建管理员: ${bootstrapEmail}`);
  } else if (!admin) {
    console.warn(
      "未找到管理员。请设置 BOOTSTRAP_ADMIN_EMAIL 与 BOOTSTRAP_ADMIN_PASSWORD 后重新运行 npm run db:seed"
    );
  }

  const defaultLogo = await prisma.logo.upsert({
    where: { id: "default-logo" },
    update: {},
    create: {
      id: "default-logo",
      filename: "default-logo.svg",
      path: "/uploads/logos/default-logo.svg",
      mimeType: "image/svg+xml",
      sizeBytes: 512,
      altText: "新手指南站",
      isDefault: true,
      updatedById: admin?.id,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "新手指南站",
      tagline: "帮你一步步完成手机应用安装与账号注册",
      homeTitle: "手机应用安装新手指南",
      homeDescription:
        "面向不熟悉手机应用安装、账号注册和相关网络服务的新手。我们只提供清晰教程与服务说明，不代注册、不买卖账号、不收集密码或恢复码。",
      announcement: "当前为演示模式：订单付款与接码均为模拟流程，不会产生真实扣款或真实验证码。",
      footerText:
        "本站仅提供公开教程与服务说明，不代注册、不买卖账号、不收集密码或恢复码。",
      contactEmail: "support@example.com",
      disclaimer:
        "本站内容仅供学习参考。请始终通过官方渠道完成注册与下载。接码、VPN、静态住宅 IP 不能保证账号安全，也无法绕过平台风控。本站不对第三方服务结果负责。",
      privacyText:
        "我们不会收集、存储或展示您的账号密码、验证码或恢复码。演示订单与模拟付款仅为测试数据，用于展示流程。",
      termsText:
        "使用本站即表示您理解：本站不提供代注册、账号买卖或任何规避平台规则的服务。请遵守 Apple、Google 及应用开发者的服务条款。",
      seoTitle: "新手指南站 - 手机应用安装与账号注册教程",
      seoDescription:
        "面向新手的苹果与安卓手机应用安装、官方账号注册、接码与 VPN 选择指南。",
      logoAlt: "新手指南站",
      activeLogoId: defaultLogo.id,
      demoMode: true,
    },
  });

  const navItems = [
    { label: "首页", href: "/", order: 0 },
    { label: "苹果指南", href: "/ios", order: 1 },
    { label: "安卓指南", href: "/android", order: 2 },
    { label: "服务与价格", href: "/services", order: 3 },
    { label: "订单说明", href: "/orders", order: 4 },
    { label: "接码演示", href: "/demo/sms", order: 5 },
    { label: "常见问题", href: "/faq", order: 6 },
  ];

  await prisma.navItem.deleteMany();
  await prisma.navItem.createMany({ data: navItems });

  await prisma.entryCard.deleteMany();
  await prisma.entryCard.createMany({
    data: [
      {
        platform: "ios",
        title: "苹果手机指南",
        description: "了解其他国家或地区 Apple 账户注册、应用下载与网络服务选择。",
        href: "/ios",
        order: 0,
        visible: true,
      },
      {
        platform: "android",
        title: "安卓手机指南",
        description: "检查 Google 服务支持情况，并通过官方渠道注册与安装应用。",
        href: "/android",
        order: 1,
        visible: true,
      },
    ],
  });

  // iOS tutorial
  const iosTutorial = await prisma.tutorial.upsert({
    where: { slug: "ios-getting-started" },
    update: {},
    create: {
      slug: "ios-getting-started",
      platform: "ios",
      title: "苹果手机入门指南",
      summary:
        "面向新手的 Apple 账户、接码、VPN、应用安装与静态住宅 IP 说明。全程建议使用官方渠道。",
      readingMinutes: 12,
      status: "PUBLISHED",
      order: 0,
      sourceNote: "优先参考 Apple 官方帮助文档；未核实链接已标记为 TODO。",
      publishedAt: new Date(),
      steps: {
        create: [
          {
            order: 0,
            title: "通过官方方式了解/注册 Apple 账户",
            body: "请使用 Apple 官方流程创建或管理账户。不同国家或地区的账户有不同的付款方式与可用内容。本站不会代您注册，也不会收集您的密码或恢复码。",
            tip: "请自行保管安全信息，切勿将密码、验证码发给任何人。",
            sourceUrl: "https://support.apple.com/zh-cn/HT204397",
            sourceNote: "Apple 官方：创建 Apple 账户",
          },
          {
            order: 1,
            title: "接码服务流程介绍（演示）",
            body: "部分注册流程需要接收短信验证码。本站仅介绍一般流程：选择国家/地区 → 获取临时号码（演示）→ 在官方页面填写 → 查看演示验证码。当前为演示模式，不会连接真实接码服务商，也不会保证注册成功或绕过风控。",
            tip: "演示模式，未连接真实服务。真实接入前需服务商授权与正式 API 文档。",
            sourceUrl: null,
            sourceNote: "TODO：接入经授权的接码服务商官方文档后再替换本说明。",
          },
          {
            order: 2,
            title: "VPN 选择指南",
            body: "如需使用网络代理工具，请选择信誉良好、条款清晰的服务，并了解当地法律法规。VPN 不能保证账号安全，也不能绕过平台风控。本站不推荐具体规避用途。",
            tip: "优先阅读服务商隐私政策与退款说明。",
            sourceUrl: null,
            sourceNote: "TODO：补充经核实的公开评测或官方说明链接。",
          },
          {
            order: 3,
            title: "应用官方下载与安装",
            body: "请通过 App Store 或应用开发者官网获取应用。避免第三方不明来源安装包。安装前确认开发者名称与权限说明。",
            tip: "如遇地区限制，请遵循官方支持文档，不要使用来历不明的账号。",
            sourceUrl: "https://support.apple.com/zh-cn/HT204390",
            sourceNote: "Apple 官方：在 App Store 中下载 App",
          },
          {
            order: 4,
            title: "静态住宅 IP 选择指南",
            body: "静态住宅 IP 属于网络接入类服务，常用于稳定访问。它不能保证账号安全，也不能声称可绕过平台风控。选择时请核对服务商资质、计费方式与售后条款。",
            tip: "本站不对第三方 IP 服务结果做任何保证。",
            sourceUrl: null,
            sourceNote: "TODO：补充经核实的服务商对比资料（如有）。",
          },
        ],
      },
      faqs: {
        create: [
          {
            order: 0,
            question: "你们会帮我注册 Apple 账户吗？",
            answer: "不会。本站只提供官方流程说明，不代注册、不买卖账号。",
          },
          {
            order: 1,
            question: "接码能否保证注册成功？",
            answer: "不能。接码仅用于接收短信，无法保证账号安全或绕过平台风控。当前为演示模式。",
          },
        ],
      },
    },
  });

  const androidTutorial = await prisma.tutorial.upsert({
    where: { slug: "android-getting-started" },
    update: {},
    create: {
      slug: "android-getting-started",
      platform: "android",
      title: "安卓手机入门指南",
      summary:
        "检查 Google 服务支持、官方注册 Google 账号，以及接码、VPN、应用安装与静态住宅 IP 说明。",
      readingMinutes: 14,
      status: "PUBLISHED",
      order: 0,
      sourceNote: "优先参考 Google 官方帮助；未核实链接已标记为 TODO。",
      publishedAt: new Date(),
      steps: {
        create: [
          {
            order: 0,
            title: "检查设备是否支持 Google 服务与 Google Play",
            body: "部分安卓设备预装 Google 移动服务（GMS），可直接使用 Google Play。若设备不支持，请先查阅手机厂商说明，不要随意刷入不明系统包。",
            tip: "可在系统设置中查看是否已有 Google 相关选项。",
            sourceUrl: "https://support.google.com/googleplay/answer/2361601",
            sourceNote: "Google 官方：排查 Google Play 商店问题",
          },
          {
            order: 1,
            title: "通过官方渠道注册 Google 账号",
            body: "请前往 Google 账号官方注册页面创建账号。本站不会代您注册，也不会收集密码或恢复邮箱/手机。请妥善保管恢复信息。",
            tip: "建议启用两步验证，并仅在官方页面输入验证码。",
            sourceUrl: "https://accounts.google.com/signup",
            sourceNote: "Google 官方注册入口",
          },
          {
            order: 2,
            title: "接码服务流程介绍（演示）",
            body: "注册时如需短信验证，可了解接码服务的一般流程。当前网站接码功能为演示模式，使用模拟数据，不会发起真实下单或读取真实验证码。",
            tip: "演示模式，未连接真实服务。",
            sourceUrl: null,
            sourceNote: "TODO：取得服务商授权与正式 API 文档后再启用真实模式。",
          },
          {
            order: 3,
            title: "VPN 选择指南",
            body: "选择 VPN 时关注隐私政策、日志策略、计费透明度和合规性。VPN 不能保证账号安全，也不能用于绕过平台风控。",
            tip: "请遵守当地法律与服务条款。",
            sourceUrl: null,
            sourceNote: "TODO：补充经核实的公开资料链接。",
          },
          {
            order: 4,
            title: "应用官方下载与安装",
            body: "优先通过 Google Play 或开发者官网下载。安装未知来源应用存在风险，请谨慎开启相关权限。",
            tip: "核对应用包名与开发者信息。",
            sourceUrl: "https://support.google.com/googleplay/answer/113412",
            sourceNote: "Google 官方：在 Google Play 上查找并安装应用",
          },
          {
            order: 5,
            title: "静态住宅 IP 选择指南",
            body: "如需稳定网络出口，可了解静态住宅 IP。服务商宣传中关于“保号/过检”的说法不可轻信；本站明确不声称此类服务能保证账号安全或绕过风控。",
            tip: "核对合同、售后与退款条款后再购买。",
            sourceUrl: null,
            sourceNote: "TODO：补充经核实的服务说明链接。",
          },
        ],
      },
      faqs: {
        create: [
          {
            order: 0,
            question: "没有 Google Play 怎么办？",
            answer:
              "请先确认设备是否支持 GMS，并查阅手机厂商与 Google 官方说明。不要下载来历不明的安装包。",
          },
          {
            order: 1,
            question: "你们会保存我的验证码吗？",
            answer: "不会。系统不会保存或展示用户账号密码、验证码或恢复码。",
          },
        ],
      },
    },
  });

  void iosTutorial;
  void androidTutorial;

  await prisma.faqItem.deleteMany();
  await prisma.faqItem.createMany({
    data: [
      {
        question: "这个网站能帮我代注册账号吗？",
        answer: "不能。我们只提供公开教程与服务说明，不代注册、不买卖账号。",
        category: "general",
        status: "PUBLISHED",
        order: 0,
      },
      {
        question: "为什么付款显示“演示模式”？",
        answer:
          "当前未接入真实支付渠道。模拟付款仅用于展示流程，不会产生真实扣款，也不会伪造真实支付成功状态之外的虚假承诺。",
        category: "payment",
        status: "PUBLISHED",
        order: 1,
      },
      {
        question: "接码是真的吗？",
        answer:
          "默认是演示模式，界面会明确提示“演示模式，未连接真实服务”。真实接入前需要服务商授权、API 文档与服务条款。",
        category: "sms",
        status: "PUBLISHED",
        order: 2,
      },
      {
        question: "VPN 或静态 IP 能保证账号安全吗？",
        answer: "不能。任何接码、VPN 或静态住宅 IP 都不能保证账号安全，也无法绕过平台风控。",
        category: "safety",
        status: "PUBLISHED",
        order: 3,
      },
    ],
  });

  const smsService = await prisma.serviceItem.upsert({
    where: { id: "svc-sms-demo" },
    update: {},
    create: {
      id: "svc-sms-demo",
      name: "接码服务（演示）",
      category: "接码",
      description: "演示用临时号码接收短信验证码流程。不保证注册成功，不绕过风控。",
      notes: "演示模式：不会连接真实接码 API。",
      status: "PUBLISHED",
      available: true,
      order: 0,
    },
  });

  const vpnService = await prisma.serviceItem.upsert({
    where: { id: "svc-vpn-guide" },
    update: {},
    create: {
      id: "svc-vpn-guide",
      name: "VPN 选择咨询（说明）",
      category: "网络",
      description: "帮助您了解选择 VPN 时需关注的条款与隐私要点。不提供绕过风控方案。",
      notes: "咨询类说明服务，不承诺任何平台结果。",
      status: "PUBLISHED",
      available: true,
      order: 1,
    },
  });

  const ipService = await prisma.serviceItem.upsert({
    where: { id: "svc-ip-guide" },
    update: {},
    create: {
      id: "svc-ip-guide",
      name: "静态住宅 IP 选型说明",
      category: "网络",
      description: "介绍静态住宅 IP 的常见计费与注意事项。不能保证账号安全。",
      notes: "请通过正规服务商购买。",
      status: "PUBLISHED",
      available: true,
      order: 2,
    },
  });

  await prisma.pricePlan.deleteMany();
  await prisma.pricePlan.createMany({
    data: [
      {
        serviceId: smsService.id,
        name: "演示套餐 · 单次",
        amount: 3.5,
        currency: "CNY",
        unit: "次",
        description: "演示价格，模拟下单用。",
        enabled: true,
        order: 0,
        updatedById: admin?.id,
      },
      {
        serviceId: smsService.id,
        name: "演示套餐 · 5 次包",
        amount: 15,
        currency: "CNY",
        unit: "包",
        description: "演示打包价。",
        enabled: true,
        order: 1,
        updatedById: admin?.id,
      },
      {
        serviceId: vpnService.id,
        name: "选型说明（演示）",
        amount: 0,
        currency: "CNY",
        unit: "次",
        description: "免费说明内容，演示订单金额可为 0。",
        enabled: true,
        order: 0,
        updatedById: admin?.id,
      },
      {
        serviceId: ipService.id,
        name: "选型说明（演示）",
        amount: 9.9,
        currency: "CNY",
        unit: "次",
        description: "演示咨询价。",
        enabled: true,
        order: 0,
        updatedById: admin?.id,
      },
    ],
  });

  await prisma.paymentMethod.deleteMany();
  await prisma.paymentMethod.createMany({
    data: [
      {
        name: "模拟付款（演示）",
        description:
          "演示模式专用。点击确认后仅将订单标记为“模拟已付款”，不会产生真实扣款，也不会对接银行或第三方支付。",
        enabled: true,
        isDemo: true,
        order: 0,
      },
      {
        name: "线下转账说明（未开通）",
        description: "预留展示。真实支付需按支付服务商官方文档接入并完成回调验签。",
        enabled: false,
        isDemo: true,
        order: 1,
      },
    ],
  });

  await prisma.smsProviderConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      mode: "demo",
      displayName: "演示接码",
      note: "演示模式，未连接真实服务。未取得服务商授权及正式 API 文档前，不会发起真实下单或读取验证码。",
      enabled: true,
    },
  });

  const demoMethod = await prisma.paymentMethod.findFirst({
    where: { isDemo: true, enabled: true },
  });
  const price = await prisma.pricePlan.findFirst({
    where: { serviceId: smsService.id, enabled: true },
  });

  await prisma.order.deleteMany({ where: { isDemo: true } });
  if (price && demoMethod) {
    await prisma.order.createMany({
      data: [
        {
          orderNo: "DEMO-20260328-001",
          serviceId: smsService.id,
          pricePlanId: price.id,
          paymentMethodId: demoMethod.id,
          amount: price.amount,
          currency: "CNY",
          customerNote: "【测试数据】演示订单",
          orderStatus: "COMPLETED",
          paymentStatus: "PAID",
          isDemo: true,
          paidAt: new Date(),
        },
        {
          orderNo: "DEMO-20260328-002",
          serviceId: smsService.id,
          pricePlanId: price.id,
          paymentMethodId: demoMethod.id,
          amount: price.amount,
          currency: "CNY",
          customerNote: "【测试数据】待处理演示订单",
          orderStatus: "PENDING",
          paymentStatus: "UNPAID",
          isDemo: true,
        },
        {
          orderNo: "DEMO-20260328-003",
          serviceId: ipService.id,
          amount: 9.9,
          currency: "CNY",
          customerNote: "【测试数据】处理中",
          orderStatus: "PROCESSING",
          paymentStatus: "PENDING",
          isDemo: true,
        },
      ],
    });
  }

  if (admin) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "SEED",
        entity: "System",
        detail: "初始化演示数据（含测试订单与演示付款）",
      },
    });
  }

  console.log("演示数据初始化完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
