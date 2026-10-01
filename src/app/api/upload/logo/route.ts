import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireSession, unauthorized, forbidden } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN", "EDITOR"]);
  if (!auth) return unauthorized();

  try {
    const form = await req.formData();
    const file = form.get("file");
    const altText = String(form.get("altText") || "网站 Logo");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "仅支持 PNG、JPEG、WebP、GIF、SVG 图片" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "文件大小不能超过 2MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    // Basic sniff: reject obviously non-image binary pretending as svg/xml text only for svg
    if (file.type !== "image/svg+xml") {
      const header = bytes.subarray(0, 12);
      const isPng = header[0] === 0x89 && header[1] === 0x50;
      const isJpg = header[0] === 0xff && header[1] === 0xd8;
      const isGif = header[0] === 0x47 && header[1] === 0x49;
      const isWebp =
        header[0] === 0x52 && header[1] === 0x49 && header[8] === 0x57 && header[9] === 0x45;
      if (!isPng && !isJpg && !isGif && !isWebp) {
        return NextResponse.json({ error: "文件内容不是有效图片" }, { status: 400 });
      }
    } else {
      const text = bytes.toString("utf8", 0, Math.min(bytes.length, 200)).toLowerCase();
      if (!text.includes("<svg") || text.includes("<script")) {
        return NextResponse.json({ error: "SVG 内容无效或不安全" }, { status: 400 });
      }
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/webp"
            ? "webp"
            : file.type === "image/gif"
              ? "gif"
              : "svg";

    const filename = `logo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);

    const logo = await prisma.logo.create({
      data: {
        filename,
        path: `/uploads/logos/${filename}`,
        mimeType: file.type,
        sizeBytes: file.size,
        altText,
        isDefault: false,
        updatedById: auth.user.id,
      },
    });

    await writeAudit({
      userId: auth.user.id,
      action: "UPLOAD",
      entity: "Logo",
      entityId: logo.id,
      detail: `上传 Logo ${filename}`,
    });

    return NextResponse.json({ logo });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "上传失败" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession(["ADMIN", "EDITOR"]);
  if (!auth) return unauthorized();

  const body = await req.json();
  const { logoId, altText, activate, remove } = body as {
    logoId?: string;
    altText?: string;
    activate?: boolean;
    remove?: boolean;
  };

  if (!logoId) return NextResponse.json({ error: "缺少 logoId" }, { status: 400 });

  const logo = await prisma.logo.findUnique({ where: { id: logoId } });
  if (!logo) return NextResponse.json({ error: "Logo 不存在" }, { status: 404 });

  if (remove) {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings?.activeLogoId === logoId) {
      const fallback =
        (await prisma.logo.findFirst({ where: { isDefault: true } })) ||
        (await prisma.logo.findFirst({ where: { id: { not: logoId } } }));
      if (!fallback) {
        return NextResponse.json({ error: "请先准备默认 Logo 再移除当前 Logo" }, { status: 400 });
      }
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: { activeLogoId: fallback.id },
      });
    }
    if (logo.isDefault) {
      return NextResponse.json({ error: "默认 Logo 不可删除，可切换为其他 Logo" }, { status: 400 });
    }
    // EDITOR can remove non-active; ADMIN always
    if (auth.user.role !== "ADMIN" && auth.user.role !== "EDITOR") return forbidden();
    await prisma.logo.delete({ where: { id: logoId } });
    await writeAudit({
      userId: auth.user.id,
      action: "DELETE",
      entity: "Logo",
      entityId: logoId,
      detail: "移除 Logo",
    });
    return NextResponse.json({ ok: true });
  }

  if (typeof altText === "string") {
    await prisma.logo.update({
      where: { id: logoId },
      data: { altText, updatedById: auth.user.id },
    });
  }

  if (activate) {
    await prisma.siteSettings.update({
      where: { id: "default" },
      data: {
        activeLogoId: logoId,
        logoAlt: altText || logo.altText,
      },
    });
    await prisma.logo.update({
      where: { id: logoId },
      data: { updatedById: auth.user.id },
    });
    await writeAudit({
      userId: auth.user.id,
      action: "ACTIVATE",
      entity: "Logo",
      entityId: logoId,
      detail: "启用 Logo",
    });
  }

  return NextResponse.json({ ok: true });
}
