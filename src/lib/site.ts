import { prisma } from "./prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    include: { activeLogo: true },
  });
  if (!settings) {
    return {
      id: "default",
      siteName: "新手指南站",
      tagline: "帮你一步步完成手机应用安装与账号注册",
      homeTitle: "手机应用安装新手指南",
      homeDescription:
        "面向不熟悉手机应用安装与账号注册的新手，提供清晰易懂的操作说明。",
      announcement: "当前为演示模式。",
      footerText: "本站仅提供公开教程与服务说明。",
      contactEmail: null as string | null,
      contactWechat: null as string | null,
      disclaimer: "",
      privacyText: "",
      termsText: "",
      seoTitle: "新手指南站",
      seoDescription: "",
      logoAlt: "网站 Logo",
      activeLogoId: null as string | null,
      activeLogo: null as null | { path: string; altText: string },
      demoMode: true,
      updatedAt: new Date(),
    };
  }
  return settings;
}

export async function getVisibleNav() {
  return prisma.navItem.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}

export async function getEntryCards() {
  return prisma.entryCard.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
}
