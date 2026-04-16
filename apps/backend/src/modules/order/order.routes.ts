import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireStoreAccess } from '../auth/auth.middleware.js';
import {
  createOrderSchema,
  transitionSchema,
  assignCourierSchema,
  substitutionSchema,
  cancelOrderSchema,
  orderQuerySchema,
} from './order.schemas.js';
import {
  createOrderFromCart,
  getOrder,
  getOrderForCustomer,
  listOrdersForCustomer,
  listOrdersForStore,
  transitionStatus,
  assignCourier,
  handleSubstitution,
  reorderFromPrevious,
  cancelOrder,
} from './order.service.js';
import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';

export async function orderRoutes(app: FastifyInstance) {
  // ==========================================================================
  // Customer routes
  // ==========================================================================

  // POST /stores/:storeId/orders — create order from cart
  app.post<{
    Params: { storeId: string };
  }>('/stores/:storeId/orders', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { storeId } = request.params;
    const input = createOrderSchema.parse(request.body);
    const customerId = await getCustomerId(request.currentUser.userId);
    const order = await createOrderFromCart(customerId, storeId, input);
    return { data: order };
  });

  // GET /orders/my — list customer's orders
  app.get('/orders/my', {
    preHandler: [requireAuth],
  }, async (request) => {
    const customerId = await getCustomerId(request.currentUser.userId);
    const query = orderQuerySchema.parse(request.query);
    const result = await listOrdersForCustomer(customerId, {
      page: query.page,
      pageSize: query.pageSize,
    });
    return result;
  });

  // GET /orders/:orderId — get order detail (customer sees own only)
  app.get<{
    Params: { orderId: string };
  }>('/orders/:orderId', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { orderId } = request.params;
    const customerId = await getCustomerId(request.currentUser.userId);
    const order = await getOrderForCustomer(orderId, customerId);
    return { data: order };
  });

  // POST /orders/:orderId/cancel — cancel order (customer)
  app.post<{
    Params: { orderId: string };
  }>('/orders/:orderId/cancel', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { orderId } = request.params;
    const { reason } = cancelOrderSchema.parse(request.body);
    const customerId = await getCustomerId(request.currentUser.userId);

    // Verify customer owns this order
    await getOrderForCustomer(orderId, customerId);

    const order = await cancelOrder(orderId, customerId, 'customer', reason);
    return { data: order };
  });

  // POST /orders/:orderId/reorder — reorder from previous
  app.post<{
    Params: { orderId: string };
  }>('/orders/:orderId/reorder', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { orderId } = request.params;
    const customerId = await getCustomerId(request.currentUser.userId);

    // We need the store ID from the original order
    const originalOrder = await getOrderForCustomer(orderId, customerId);

    const result = await reorderFromPrevious(orderId, customerId, originalOrder.storeId);
    return { data: result };
  });

  // ==========================================================================
  // Staff routes
  // ==========================================================================

  // GET /stores/:storeId/orders — list store orders
  app.get<{
    Params: { storeId: string };
  }>('/stores/:storeId/orders', {
    preHandler: [requireAuth, requireStoreAccess('storeId')],
  }, async (request) => {
    const { storeId } = request.params;
    const query = orderQuerySchema.parse(request.query);
    const result = await listOrdersForStore(storeId, {
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });
    return result;
  });

  // GET /stores/:storeId/orders/:orderId — get order detail (staff)
  app.get<{
    Params: { storeId: string; orderId: string };
  }>('/stores/:storeId/orders/:orderId', {
    preHandler: [requireAuth, requireStoreAccess('storeId')],
  }, async (request) => {
    const { storeId, orderId } = request.params;
    const order = await getOrder(orderId);

    if (order.storeId !== storeId) {
      throw new NotFoundError('Order', orderId);
    }

    return { data: order };
  });

  // POST /stores/:storeId/orders/:orderId/transition — transition status
  app.post<{
    Params: { storeId: string; orderId: string };
  }>('/stores/:storeId/orders/:orderId/transition', {
    preHandler: [requireAuth, requireStoreAccess('storeId')],
  }, async (request) => {
    const { storeId, orderId } = request.params;
    const { toStatus, note } = transitionSchema.parse(request.body);

    // Verify order belongs to store
    const order = await getOrder(orderId);
    if (order.storeId !== storeId) {
      throw new NotFoundError('Order', orderId);
    }

    const updatedOrder = await transitionStatus(
      orderId,
      toStatus,
      request.currentUser.userId,
      'staff',
      note,
    );
    return { data: updatedOrder };
  });

  // POST /stores/:storeId/orders/:orderId/assign-courier — assign courier
  app.post<{
    Params: { storeId: string; orderId: string };
  }>('/stores/:storeId/orders/:orderId/assign-courier', {
    preHandler: [requireAuth, requireStoreAccess('storeId')],
  }, async (request) => {
    const { storeId, orderId } = request.params;
    const { courierId } = assignCourierSchema.parse(request.body);

    // Verify order belongs to store
    const order = await getOrder(orderId);
    if (order.storeId !== storeId) {
      throw new NotFoundError('Order', orderId);
    }

    const updatedOrder = await assignCourier(
      orderId,
      courierId,
      request.currentUser.userId,
    );
    return { data: updatedOrder };
  });

  // POST /stores/:storeId/orders/:orderId/items/:itemId/substitution
  app.post<{
    Params: { storeId: string; orderId: string; itemId: string };
  }>('/stores/:storeId/orders/:orderId/items/:itemId/substitution', {
    preHandler: [requireAuth, requireStoreAccess('storeId')],
  }, async (request) => {
    const { storeId, orderId, itemId } = request.params;
    const { action, note } = substitutionSchema.parse(request.body);

    // Verify order belongs to store
    const order = await getOrder(orderId);
    if (order.storeId !== storeId) {
      throw new NotFoundError('Order', orderId);
    }

    const updatedOrder = await handleSubstitution(
      orderId,
      itemId,
      action,
      note,
      request.currentUser.userId,
    );
    return { data: updatedOrder };
  });

  // ==========================================================================
  // Courier routes
  // ==========================================================================

  // GET /courier/orders — list assigned orders for current courier
  app.get('/courier/orders', {
    preHandler: [requireAuth],
  }, async (request) => {
    const courier = await prisma.courier.findUnique({
      where: { userId: request.currentUser.userId },
    });

    if (!courier) {
      throw new ForbiddenError('You are not registered as a courier');
    }

    const query = orderQuerySchema.parse(request.query);

    const where: Record<string, unknown> = { courierId: courier.id };
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page;
    const pageSize = query.pageSize;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: true,
          store: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.order.count({ where }),
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
  });

  // GET /courier/orders/:orderId — get order detail for courier
  app.get<{
    Params: { orderId: string };
  }>('/courier/orders/:orderId', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { orderId } = request.params;

    const courier = await prisma.courier.findUnique({
      where: { userId: request.currentUser.userId },
    });

    if (!courier) {
      throw new ForbiddenError('You are not registered as a courier');
    }

    const order = await getOrder(orderId);

    if (order.courierId !== courier.id) {
      throw new ForbiddenError('This order is not assigned to you');
    }

    return { data: order };
  });

  // POST /courier/orders/:orderId/transition — courier transitions (IN_DELIVERY, DELIVERED)
  app.post<{
    Params: { orderId: string };
  }>('/courier/orders/:orderId/transition', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { orderId } = request.params;
    const { toStatus } = transitionSchema.parse(request.body);

    // Only allow courier-specific transitions
    const allowedCourierStatuses = ['IN_DELIVERY', 'DELIVERED'];
    if (!allowedCourierStatuses.includes(toStatus)) {
      throw new ForbiddenError(
        `Couriers can only transition to: ${allowedCourierStatuses.join(', ')}`,
      );
    }

    const courier = await prisma.courier.findUnique({
      where: { userId: request.currentUser.userId },
    });

    if (!courier) {
      throw new ForbiddenError('You are not registered as a courier');
    }

    const order = await getOrder(orderId);

    if (order.courierId !== courier.id) {
      throw new ForbiddenError('This order is not assigned to you');
    }

    const updatedOrder = await transitionStatus(
      orderId,
      toStatus,
      request.currentUser.userId,
      'courier',
    );
    return { data: updatedOrder };
  });
}

// ---------------------------------------------------------------------------
// Helper: resolve customerId from userId
// ---------------------------------------------------------------------------

async function getCustomerId(userId: string): Promise<string> {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new NotFoundError('CustomerProfile');
  }

  return profile.id;
}
