import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth, requireRole, requireStoreAccess } from '../auth/auth.middleware.js';
import {
  createStoreSchema,
  updateStoreSchema,
  updateStoreSettingsSchema,
  updateWorkingHoursSchema,
  toggleStoreStatusSchema,
} from './store.schemas.js';
import {
  resolveStoreBySlug,
  getStoreBootstrap,
  listStores,
  createStore,
  updateStore,
  updateStoreSettings,
  toggleStoreStatus,
  getWorkingHours,
  updateWorkingHours,
} from './store.service.js';

// ----------------------------------------------------------------
// Route parameter / body types
// ----------------------------------------------------------------
interface SlugParams {
  slug: string;
}

interface StoreIdParams {
  storeId: string;
}

interface PaginationQuery {
  page?: string;
  pageSize?: string;
}

export async function storeRoutes(app: FastifyInstance): Promise<void> {
  // ==============================================================
  // Public routes
  // ==============================================================

  /**
   * GET /stores/resolve/:slug
   * Resolve a store by its slug (public, no auth needed).
   */
  app.get<{ Params: SlugParams }>(
    '/resolve/:slug',
    async (request: FastifyRequest<{ Params: SlugParams }>, _reply: FastifyReply) => {
      const store = await resolveStoreBySlug(request.params.slug);
      return {
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        status: store.status,
        settings: store.settings,
      };
    },
  );

  /**
   * GET /stores/:storeId/bootstrap
   * Full bootstrap payload for the Mini App.
   */
  app.get<{ Params: StoreIdParams }>(
    '/:storeId/bootstrap',
    async (request: FastifyRequest<{ Params: StoreIdParams }>, _reply: FastifyReply) => {
      return getStoreBootstrap(request.params.storeId);
    },
  );

  // ==============================================================
  // Admin routes
  // ==============================================================

  /**
   * GET /stores
   * Paginated list of stores (super_admin only).
   */
  app.get<{ Querystring: PaginationQuery }>(
    '/',
    { preHandler: [requireAuth, requireRole(['SUPER_ADMIN'])] },
    async (request: FastifyRequest<{ Querystring: PaginationQuery }>, _reply: FastifyReply) => {
      const page = Number(request.query.page) || 1;
      const pageSize = Number(request.query.pageSize) || 20;
      return listStores(page, pageSize);
    },
  );

  /**
   * POST /stores
   * Create a new store (super_admin only).
   */
  app.post(
    '/',
    { preHandler: [requireAuth, requireRole(['SUPER_ADMIN'])] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = createStoreSchema.parse(request.body);
      const store = await createStore(data);
      return reply.status(201).send(store);
    },
  );

  /**
   * PUT /stores/:storeId
   * Update a store (super_admin or store_manager).
   */
  app.put<{ Params: StoreIdParams }>(
    '/:storeId',
    { preHandler: [requireAuth, requireStoreAccess('storeId')] },
    async (request: FastifyRequest<{ Params: StoreIdParams }>, _reply: FastifyReply) => {
      const data = updateStoreSchema.parse(request.body);
      return updateStore(request.params.storeId, data);
    },
  );

  /**
   * PUT /stores/:storeId/settings
   * Update store settings.
   */
  app.put<{ Params: StoreIdParams }>(
    '/:storeId/settings',
    { preHandler: [requireAuth, requireStoreAccess('storeId')] },
    async (request: FastifyRequest<{ Params: StoreIdParams }>, _reply: FastifyReply) => {
      const data = updateStoreSettingsSchema.parse(request.body);
      return updateStoreSettings(request.params.storeId, data);
    },
  );

  /**
   * PUT /stores/:storeId/status
   * Toggle store status.
   */
  app.put<{ Params: StoreIdParams }>(
    '/:storeId/status',
    { preHandler: [requireAuth, requireStoreAccess('storeId')] },
    async (request: FastifyRequest<{ Params: StoreIdParams }>, _reply: FastifyReply) => {
      const { status } = toggleStoreStatusSchema.parse(request.body);
      return toggleStoreStatus(request.params.storeId, status);
    },
  );

  /**
   * GET /stores/:storeId/working-hours
   * Get working hours for a store.
   */
  app.get<{ Params: StoreIdParams }>(
    '/:storeId/working-hours',
    { preHandler: [requireAuth, requireStoreAccess('storeId')] },
    async (request: FastifyRequest<{ Params: StoreIdParams }>, _reply: FastifyReply) => {
      return getWorkingHours(request.params.storeId);
    },
  );

  /**
   * PUT /stores/:storeId/working-hours
   * Replace working hours for a store.
   */
  app.put<{ Params: StoreIdParams }>(
    '/:storeId/working-hours',
    { preHandler: [requireAuth, requireStoreAccess('storeId')] },
    async (request: FastifyRequest<{ Params: StoreIdParams }>, _reply: FastifyReply) => {
      const hours = updateWorkingHoursSchema.parse(request.body);
      return updateWorkingHours(request.params.storeId, hours);
    },
  );
}
