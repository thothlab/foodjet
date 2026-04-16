import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  toggleAvailabilitySchema,
  productQuerySchema,
  searchQuerySchema,
} from './catalog.schemas.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  searchProducts,
} from './catalog.service.js';

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

// ── Plugin ───────────────────────────────────────────────────

export async function catalogRoutes(app: FastifyInstance) {
  // ────────────────────────────── Public routes ──────────────

  // GET /stores/:storeId/categories
  app.get(
    '/stores/:storeId/categories',
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
    ) => {
      const { storeId } = request.params;
      const categories = await listCategories(storeId, { includeInactive: false });
      return { data: categories };
    },
  );

  // GET /stores/:storeId/products
  app.get(
    '/stores/:storeId/products',
    async (
      request: FastifyRequest<{
        Params: { storeId: string };
        Querystring: Record<string, string>;
      }>,
    ) => {
      const { storeId } = request.params;
      const query = productQuerySchema.parse(request.query);
      const result = await listProducts(storeId, {
        categoryId: query.categoryId,
        page: query.page,
        pageSize: query.pageSize,
      });
      return { data: result };
    },
  );

  // GET /stores/:storeId/products/search
  app.get(
    '/stores/:storeId/products/search',
    async (
      request: FastifyRequest<{
        Params: { storeId: string };
        Querystring: Record<string, string>;
      }>,
    ) => {
      const { storeId } = request.params;
      const query = searchQuerySchema.parse(request.query);
      const result = await searchProducts(storeId, query.q, {
        page: query.page,
        pageSize: query.pageSize,
      });
      return { data: result };
    },
  );

  // GET /products/:productId
  app.get(
    '/products/:productId',
    async (
      request: FastifyRequest<{ Params: { productId: string } }>,
    ) => {
      const { productId } = request.params;
      const product = await getProduct(productId);
      return { data: product };
    },
  );

  // ────────────────────────────── Admin routes ───────────────

  // POST /stores/:storeId/categories
  app.post(
    '/stores/:storeId/categories',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
      reply: FastifyReply,
    ) => {
      const { storeId } = request.params;
      const data = createCategorySchema.parse(request.body);
      const category = await createCategory(storeId, data);
      return reply.status(201).send({ data: category });
    },
  );

  // PUT /categories/:categoryId
  app.put(
    '/categories/:categoryId',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { categoryId: string } }>,
    ) => {
      const { categoryId } = request.params;
      const data = updateCategorySchema.parse(request.body);
      const category = await updateCategory(categoryId, data);
      return { data: category };
    },
  );

  // DELETE /categories/:categoryId
  app.delete(
    '/categories/:categoryId',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { categoryId: string } }>,
    ) => {
      const { categoryId } = request.params;
      await deleteCategory(categoryId);
      return { data: { success: true } };
    },
  );

  // POST /stores/:storeId/products
  app.post(
    '/stores/:storeId/products',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { storeId: string } }>,
      reply: FastifyReply,
    ) => {
      const { storeId } = request.params;
      const data = createProductSchema.parse(request.body);
      const product = await createProduct(storeId, data);
      return reply.status(201).send({ data: product });
    },
  );

  // PUT /products/:productId
  app.put(
    '/products/:productId',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { productId: string } }>,
    ) => {
      const { productId } = request.params;
      const data = updateProductSchema.parse(request.body);
      const product = await updateProduct(productId, data);
      return { data: product };
    },
  );

  // DELETE /products/:productId
  app.delete(
    '/products/:productId',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { productId: string } }>,
    ) => {
      const { productId } = request.params;
      await deleteProduct(productId);
      return { data: { success: true } };
    },
  );

  // PUT /products/:productId/availability
  app.put(
    '/products/:productId/availability',
    { preHandler: [authenticate] },
    async (
      request: FastifyRequest<{ Params: { productId: string } }>,
    ) => {
      const { productId } = request.params;
      const { isAvailable } = toggleAvailabilitySchema.parse(request.body);
      const product = await toggleProductAvailability(productId, isAvailable);
      return { data: product };
    },
  );
}
