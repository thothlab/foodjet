import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';

interface AuditEntry {
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  actorType?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        actorId: entry.actorId,
        actorType: entry.actorType,
        metadata: entry.metadata ?? undefined,
      },
    });
  } catch (error) {
    logger.error({ error, entry }, 'Failed to record audit log');
  }
}

export async function listAuditLogs(filters: {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const where: Record<string, unknown> = {};

  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.actorId) where.actorId = filters.actorId;

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
