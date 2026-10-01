import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden, hashPassword } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { z } from "zod";

async function guard(roles: Array<"ADMIN" | "EDITOR"> = ["ADMIN", "EDITOR"]) {
  const auth = await requireSession(roles);
  if (!auth) return null;
  return auth;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const auth = await guard();
  if (!auth) return unauthorized();
  const { resource } = await context.params;
  const { searchParams } = new URL(req.url);

  switch (resource) {
    case "dashboard": {
      const [orderCount, pending, paid, services, audits, demos] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { orderStatus: "PENDING" } }),
        prisma.order.count({ where: { paymentStatus: "PAID" } }),
        prisma.serviceItem.findMany({ orderBy: { order: "asc" }, take: 8 }),
        prisma.auditLog.findMany({
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.siteSettings.findUnique({ where: { id: "default" } }),
      ]);
      return NextResponse.json({
        stats: { orderCount, pending, paid, demoMode: demos?.demoMode ?? true },
        services,
        audits,
      });
    }
    case "settings":
      return NextResponse.json({
        settings: await prisma.siteSettings.findUnique({
          where: { id: "default" },
          include: { activeLogo: true },
        }),
        navItems: await prisma.navItem.findMany({ orderBy: { order: "asc" } }),
        entryCards: await prisma.entryCard.findMany({ orderBy: { order: "asc" } }),
      });
    case "logos":
      return NextResponse.json({
        logos: await prisma.logo.findMany({
          include: { updatedBy: true },
          orderBy: { createdAt: "desc" },
        }),
        settings: await prisma.siteSettings.findUnique({ where: { id: "default" } }),
      });
    case "tutorials":
      return NextResponse.json({
        tutorials: await prisma.tutorial.findMany({
          include: { steps: { orderBy: { order: "asc" } }, faqs: { orderBy: { order: "asc" } } },
          orderBy: [{ platform: "asc" }, { order: "asc" }],
        }),
      });
    case "services":
      return NextResponse.json({
        services: await prisma.serviceItem.findMany({
          include: { prices: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        }),
      });
    case "pricing":
      return NextResponse.json({
        prices: await prisma.pricePlan.findMany({
          include: { service: true, updatedBy: true },
          orderBy: [{ serviceId: "asc" }, { order: "asc" }],
        }),
        services: await prisma.serviceItem.findMany({ orderBy: { order: "asc" } }),
      });
    case "orders": {
      const q = searchParams.get("q") || "";
      const status = searchParams.get("status") || "";
      const payment = searchParams.get("payment") || "";
      const orders = await prisma.order.findMany({
        where: {
          AND: [
            q
              ? {
                  OR: [
                    { orderNo: { contains: q } },
                    { customerNote: { contains: q } },
                    { service: { name: { contains: q } } },
                  ],
                }
              : {},
            status ? { orderStatus: status as never } : {},
            payment ? { paymentStatus: payment as never } : {},
          ],
        },
        include: { service: true, paymentMethod: true, pricePlan: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ orders });
    }
    case "payments":
      return NextResponse.json({
        methods: await prisma.paymentMethod.findMany({ orderBy: { order: "asc" } }),
      });
    case "sms":
      return NextResponse.json({
        config: await prisma.smsProviderConfig.findUnique({ where: { id: "default" } }),
      });
    case "users": {
      if (auth.user.role !== "ADMIN") return forbidden();
      return NextResponse.json({
        users: await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "asc" },
        }),
      });
    }
    case "audit":
      return NextResponse.json({
        logs: await prisma.auditLog.findMany({
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      });
    case "faqs":
      return NextResponse.json({
        faqs: await prisma.faqItem.findMany({ orderBy: { order: "asc" } }),
      });
    default:
      return NextResponse.json({ error: "未知资源" }, { status: 404 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const auth = await guard();
  if (!auth) return unauthorized();
  const { resource } = await context.params;
  const body = await req.json();

  switch (resource) {
    case "tutorials": {
      const created = await prisma.tutorial.create({
        data: {
          slug: body.slug || `tutorial-${Date.now()}`,
          platform: body.platform || "general",
          title: body.title || "未命名教程",
          summary: body.summary || "",
          readingMinutes: Number(body.readingMinutes || 5),
          status: body.status || "DRAFT",
          order: Number(body.order || 0),
          sourceNote: body.sourceNote || null,
          publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entity: "Tutorial",
        entityId: created.id,
        detail: created.title,
      });
      return NextResponse.json({ item: created });
    }
    case "tutorial-steps": {
      const step = await prisma.tutorialStep.create({
        data: {
          tutorialId: body.tutorialId,
          title: body.title || "新步骤",
          body: body.body || "",
          tip: body.tip || null,
          sourceUrl: body.sourceUrl || null,
          sourceNote: body.sourceNote || null,
          order: Number(body.order || 0),
        },
      });
      return NextResponse.json({ item: step });
    }
    case "services": {
      const item = await prisma.serviceItem.create({
        data: {
          name: body.name || "新服务",
          category: body.category || "其他",
          description: body.description || "",
          notes: body.notes || null,
          status: body.status || "DRAFT",
          available: body.available ?? true,
          order: Number(body.order || 0),
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entity: "ServiceItem",
        entityId: item.id,
        detail: item.name,
      });
      return NextResponse.json({ item });
    }
    case "pricing": {
      const item = await prisma.pricePlan.create({
        data: {
          serviceId: body.serviceId,
          name: body.name || "新价格",
          amount: Number(body.amount || 0),
          currency: body.currency || "CNY",
          unit: body.unit || "次",
          description: body.description || null,
          enabled: body.enabled ?? true,
          order: Number(body.order || 0),
          updatedById: auth.user.id,
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entity: "PricePlan",
        entityId: item.id,
        detail: item.name,
      });
      return NextResponse.json({ item });
    }
    case "payments": {
      const item = await prisma.paymentMethod.create({
        data: {
          name: body.name || "新付款方式",
          description: body.description || "",
          enabled: body.enabled ?? false,
          isDemo: body.isDemo ?? true,
          order: Number(body.order || 0),
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entity: "PaymentMethod",
        entityId: item.id,
        detail: item.name,
      });
      return NextResponse.json({ item });
    }
    case "faqs": {
      const item = await prisma.faqItem.create({
        data: {
          question: body.question || "新问题",
          answer: body.answer || "",
          category: body.category || "general",
          status: body.status || "DRAFT",
          order: Number(body.order || 0),
        },
      });
      return NextResponse.json({ item });
    }
    case "users": {
      if (auth.user.role !== "ADMIN") return forbidden();
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(12),
        role: z.enum(["ADMIN", "EDITOR"]),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "参数无效：密码至少 12 位" }, { status: 400 });
      }
      const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (exists) return NextResponse.json({ error: "邮箱已存在" }, { status: 400 });
      const user = await prisma.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.name,
          role: parsed.data.role,
          passwordHash: await hashPassword(parsed.data.password),
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        detail: `创建账号 ${user.email} (${user.role})`,
      });
      return NextResponse.json({ user });
    }
    case "nav": {
      const item = await prisma.navItem.create({
        data: {
          label: body.label || "新导航",
          href: body.href || "/",
          order: Number(body.order || 0),
          visible: body.visible ?? true,
        },
      });
      return NextResponse.json({ item });
    }
    default:
      return NextResponse.json({ error: "未知资源" }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const auth = await guard();
  if (!auth) return unauthorized();
  const { resource } = await context.params;
  const body = await req.json();

  switch (resource) {
    case "settings": {
      const settings = await prisma.siteSettings.update({
        where: { id: "default" },
        data: {
          siteName: body.siteName,
          tagline: body.tagline,
          homeTitle: body.homeTitle,
          homeDescription: body.homeDescription,
          announcement: body.announcement,
          footerText: body.footerText,
          contactEmail: body.contactEmail,
          contactWechat: body.contactWechat,
          disclaimer: body.disclaimer,
          privacyText: body.privacyText,
          termsText: body.termsText,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          logoAlt: body.logoAlt,
          demoMode: body.demoMode ?? true,
        },
      });
      if (Array.isArray(body.navItems)) {
        for (const nav of body.navItems) {
          if (nav.id) {
            await prisma.navItem.update({
              where: { id: nav.id },
              data: {
                label: nav.label,
                href: nav.href,
                order: Number(nav.order || 0),
                visible: !!nav.visible,
              },
            });
          }
        }
      }
      if (Array.isArray(body.entryCards)) {
        for (const card of body.entryCards) {
          if (card.id) {
            await prisma.entryCard.update({
              where: { id: card.id },
              data: {
                title: card.title,
                description: card.description,
                href: card.href,
                order: Number(card.order || 0),
                visible: !!card.visible,
              },
            });
          }
        }
      }
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "SiteSettings",
        entityId: "default",
        detail: "更新站点/首页/导航设置",
      });
      return NextResponse.json({ settings });
    }
    case "tutorials": {
      const item = await prisma.tutorial.update({
        where: { id: body.id },
        data: {
          title: body.title,
          summary: body.summary,
          platform: body.platform,
          slug: body.slug,
          readingMinutes: Number(body.readingMinutes || 5),
          status: body.status,
          order: Number(body.order || 0),
          sourceNote: body.sourceNote,
          publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        },
      });
      if (Array.isArray(body.steps)) {
        for (const step of body.steps) {
          if (step.id) {
            await prisma.tutorialStep.update({
              where: { id: step.id },
              data: {
                title: step.title,
                body: step.body,
                tip: step.tip,
                sourceUrl: step.sourceUrl,
                sourceNote: step.sourceNote,
                order: Number(step.order || 0),
              },
            });
          }
        }
      }
      if (Array.isArray(body.faqs)) {
        for (const faq of body.faqs) {
          if (faq.id) {
            await prisma.tutorialFaq.update({
              where: { id: faq.id },
              data: {
                question: faq.question,
                answer: faq.answer,
                order: Number(faq.order || 0),
              },
            });
          }
        }
      }
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "Tutorial",
        entityId: item.id,
        detail: `${item.title} → ${item.status}`,
      });
      return NextResponse.json({ item });
    }
    case "services": {
      const item = await prisma.serviceItem.update({
        where: { id: body.id },
        data: {
          name: body.name,
          category: body.category,
          description: body.description,
          notes: body.notes,
          status: body.status,
          available: !!body.available,
          order: Number(body.order || 0),
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "ServiceItem",
        entityId: item.id,
        detail: item.name,
      });
      return NextResponse.json({ item });
    }
    case "pricing": {
      const item = await prisma.pricePlan.update({
        where: { id: body.id },
        data: {
          name: body.name,
          amount: Number(body.amount || 0),
          currency: body.currency || "CNY",
          unit: body.unit || "次",
          description: body.description,
          enabled: !!body.enabled,
          order: Number(body.order || 0),
          updatedById: auth.user.id,
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "PricePlan",
        entityId: item.id,
        detail: `${item.name} = ${item.amount} ${item.currency}`,
      });
      return NextResponse.json({ item });
    }
    case "orders": {
      const item = await prisma.order.update({
        where: { id: body.id },
        data: {
          orderStatus: body.orderStatus,
          paymentStatus: body.paymentStatus,
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "Order",
        entityId: item.id,
        detail: `${item.orderNo} → ${item.orderStatus}/${item.paymentStatus}`,
      });
      return NextResponse.json({ item });
    }
    case "payments": {
      const item = await prisma.paymentMethod.update({
        where: { id: body.id },
        data: {
          name: body.name,
          description: body.description,
          enabled: !!body.enabled,
          isDemo: !!body.isDemo,
          order: Number(body.order || 0),
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "PaymentMethod",
        entityId: item.id,
        detail: item.name,
      });
      return NextResponse.json({ item });
    }
    case "sms": {
      const config = await prisma.smsProviderConfig.update({
        where: { id: "default" },
        data: {
          mode: "demo", // force demo until live adapter exists
          displayName: body.displayName || "演示接码",
          note: body.note,
          enabled: body.enabled ?? true,
        },
      });
      await writeAudit({
        userId: auth.user.id,
        action: "UPDATE",
        entity: "SmsProviderConfig",
        entityId: "default",
        detail: "更新接码设置（保持演示模式）",
      });
      return NextResponse.json({ config });
    }
    case "faqs": {
      const item = await prisma.faqItem.update({
        where: { id: body.id },
        data: {
          question: body.question,
          answer: body.answer,
          category: body.category,
          status: body.status,
          order: Number(body.order || 0),
        },
      });
      return NextResponse.json({ item });
    }
    default:
      return NextResponse.json({ error: "未知资源" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  const auth = await guard(["ADMIN"]);
  if (!auth) return unauthorized();
  const { resource } = await context.params;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  switch (resource) {
    case "services":
      await prisma.serviceItem.delete({ where: { id } });
      break;
    case "pricing":
      await prisma.pricePlan.delete({ where: { id } });
      break;
    case "faqs":
      await prisma.faqItem.delete({ where: { id } });
      break;
    case "payments":
      await prisma.paymentMethod.delete({ where: { id } });
      break;
    case "tutorials":
      await prisma.tutorial.delete({ where: { id } });
      break;
    default:
      return NextResponse.json({ error: "不支持删除" }, { status: 400 });
  }

  await writeAudit({
    userId: auth.user.id,
    action: "DELETE",
    entity: resource,
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
