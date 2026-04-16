import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireStoreAccess } from '../auth/auth.middleware.js';
import { listNotifications } from './notification.service.js';

export async function notificationRoutes(app: FastifyInstance) {
  // GET /stores/:storeId/notifications — list notifications (admin/staff)
  app.get<{
    Params: { storeId: string };
  }>('/stores/:storeId/notifications', {
    preHandler: [requireAuth, requireStoreAccess('storeId')],
  }, async (request) => {
    const { storeId } = request.params;
    const query = request.query as {
      page?: string;
      pageSize?: string;
    };

    const result = await listNotifications(storeId, {
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    });

    return result;
  });
}
