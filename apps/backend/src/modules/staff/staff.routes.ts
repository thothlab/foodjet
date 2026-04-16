import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listStaffAssignments, assignStaff, revokeStaffAssignment } from './staff.service.js';

const assignStaffSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['STORE_MANAGER', 'STORE_OPERATOR', 'CATALOG_MANAGER']),
});

export async function staffRoutes(app: FastifyInstance) {
  // List staff for a store
  app.get('/stores/:storeId/staff', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
  }, async (request) => {
    const { storeId } = request.params as { storeId: string };
    return { data: await listStaffAssignments(storeId) };
  });

  // Assign staff
  app.post('/stores/:storeId/staff', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
  }, async (request, reply) => {
    const { storeId } = request.params as { storeId: string };
    const data = assignStaffSchema.parse(request.body);
    const assignment = await assignStaff(storeId, data, request.currentUser.userId);
    reply.status(201).send(assignment);
  });

  // Revoke staff assignment
  app.delete('/staff-assignments/:assignmentId', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
  }, async (request) => {
    const { assignmentId } = request.params as { assignmentId: string };
    return revokeStaffAssignment(assignmentId, request.currentUser.userId);
  });
}
