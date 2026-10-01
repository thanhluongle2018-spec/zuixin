import { prisma } from "./prisma";

export async function writeAudit(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  detail?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId || null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      detail: params.detail || null,
    },
  });
}
