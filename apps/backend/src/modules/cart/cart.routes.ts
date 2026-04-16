import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { addItemSchema, updateQuantitySchema } from './cart.schemas.js';
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  validateCart,
} from './cart.service.js';

// ── Helpers ──────────────────────────────────────────────────

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    });
  }
}

function getCustomerId(request: FastifyRequest): string {
  const user = request.user as { customerId: string };
  return user.customerId;
}

// ── Plugin ───────────────────────────────────────────────────

export async function cartRoutes(app: FastifyInstance) {
  // All cart routes require authentication
  app.addHook('preHandler', authenticate);

  // GET /stores/:storeId/cart
  app.get(
    '/stores/:storeId/cart',
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
    ) => {
      const { storeId } = request.params;
      const customerId = getCustomerId(request);
      const cart = await getCart(customerId, storeId);

      if (!cart) {
        return { data: { items: [], total: 0 } };
      }

      return { data: cart };
    },
  );

  // POST /stores/:storeId/cart/items
  app.post(
    '/stores/:storeId/cart/items',
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
      reply: FastifyReply,
    ) => {
      const { storeId } = request.params;
      const customerId = getCustomerId(request);
      const { productId, quantity } = addItemSchema.parse(request.body);
      const item = await addItem(customerId, storeId, productId, quantity);
      return reply.status(201).send({ data: item });
    },
  );

  // PUT /stores/:storeId/cart/items/:productId
  app.put(
    '/stores/:storeId/cart/items/:productId',
    async (
      request: FastifyRequest<{
        Params: { storeId: string; productId: string };
      }>,
    ) => {
      const { storeId, productId } = request.params;
      const customerId = getCustomerId(request);
      const { quantity } = updateQuantitySchema.parse(request.body);
      const item = await updateItemQuantity(customerId, storeId, productId, quantity);
      return { data: item };
    },
  );

  // DELETE /stores/:storeId/cart/items/:productId
  app.delete(
    '/stores/:storeId/cart/items/:productId',
    async (
      request: FastifyRequest<{
        Params: { storeId: string; productId: string };
      }>,
    ) => {
      const { storeId, productId } = request.params;
      const customerId = getCustomerId(request);
      await removeItem(customerId, storeId, productId);
      return { data: { success: true } };
    },
  );

  // DELETE /stores/:storeId/cart
  app.delete(
    '/stores/:storeId/cart',
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
    ) => {
      const { storeId } = request.params;
      const customerId = getCustomerId(request);
      await clearCart(customerId, storeId);
      return { data: { success: true } };
    },
  );

  // POST /stores/:storeId/cart/validate
  app.post(
    '/stores/:storeId/cart/validate',
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
    ) => {
      const { storeId } = request.params;
      const customerId = getCustomerId(request);
      const result = await validateCart(customerId, storeId);
      return { data: result };
    },
  );
}
