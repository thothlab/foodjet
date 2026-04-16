import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listCouriers, listActiveCouriers, createCourier, updateCourierStatus } from './courier.service.js';

const createCourierSchema = z.object({
  userId: z.string().uuid(),
});

const updateCourierStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export async function courierRoutes(app: FastifyInstance) {
  // List couriers for a store
  app.get('/stores/:storeId/couriers', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'])],
  }, async (request) => {
    const { storeId } = request.params as { storeId: string };
    return { data: await listCouriers(storeId) };
  });

  // List active couriers (for assignment)
  app.get('/stores/:storeId/couriers/active', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'])],
  }, async (request) => {
    const { storeId } = request.params as { storeId: string };
    return { data: await listActiveCouriers(storeId) };
  });

  // Create courier
  app.post('/stores/:storeId/couriers', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
  }, async (request, reply) => {
    const { storeId } = request.params as { storeId: string };
    const { userId } = createCourierSchema.parse(request.body);
    const courier = await createCourier(storeId, userId, request.currentUser.userId);
    reply.status(201).send(courier);
  });

  // Update courier status
  app.put('/couriers/:courierId/status', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
  }, async (request) => {
    const { courierId } = request.params as { courierId: string };
    const { status } = updateCourierStatusSchema.parse(request.body);
    return updateCourierStatus(courierId, status, request.currentUser.userId);
  });
}
