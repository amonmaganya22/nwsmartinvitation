import { prisma } from "./prisma";

export async function logAudit(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        ipAddress: params.ipAddress ?? null,
        metadata: params.metadata as any
      }
    });
  } catch (err) {
    // Auditing must never break the main request flow.
    console.error("Failed to write audit log", err);
  }
}
