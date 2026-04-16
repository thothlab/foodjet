import type { FastifyInstance } from 'fastify';
import { listAuditLogs } from './audit.service.js';

export async function auditRoutes(app: FastifyInstance) {
  // Admin only — audit log listing
  app.get('/audit', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
  }, async (request) => {
    const query = request.query as {
      entityType?: string;
      entityId?: string;
      actorId?: string;
      page?: string;
      pageSize?: string;
    };

    return listAuditLogs({
      entityType: query.entityType,
      entityId: query.entityId,
      actorId: query.actorId,
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
    });
  });
}
