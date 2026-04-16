import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'node:path';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './common/error-handler.js';
import { correlationIdHook } from './common/correlation-id.js';
import { requireAuth, requireRole, requireStoreAccess } from './modules/auth/auth.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { storeRoutes } from './modules/store/store.routes.js';
import { catalogRoutes } from './modules/catalog/catalog.routes.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { orderRoutes } from './modules/order/order.routes.js';
import { customerRoutes } from './modules/customer/customer.routes.js';
import { staffRoutes } from './modules/staff/staff.routes.js';
import { courierRoutes } from './modules/courier/courier.routes.js';
import { mediaRoutes } from './modules/media/media.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { notificationRoutes } from './modules/notification/notification.routes.js';

// Extend Fastify instance with auth decorators
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof requireAuth;
    requireRole: typeof requireRole;
    requireStoreAccess: typeof requireStoreAccess;
  }
}

export async function buildApp() {
  const app = Fastify({
    logger: false,
  });

  // --- Plugins ---
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

  // Serve uploaded files
  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // --- Auth decorators ---
  app.decorate('authenticate', requireAuth);
  app.decorate('requireRole', requireRole);
  app.decorate('requireStoreAccess', requireStoreAccess);

  // --- Hooks ---
  app.addHook('onRequest', correlationIdHook);
  app.addHook('onRequest', (request, _reply, done) => {
    logger.info(
      { method: request.method, url: request.url, correlationId: request.headers['x-correlation-id'] },
      'incoming request',
    );
    done();
  });

  // --- Error handler ---
  app.setErrorHandler(errorHandler);

  // --- Health check ---
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }));

  // --- API v1 routes ---
  await app.register(
    async (api) => {
      api.get('/ping', async () => ({ pong: true }));

      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(storeRoutes, { prefix: '/stores' });
      await api.register(catalogRoutes);
      await api.register(cartRoutes);
      await api.register(orderRoutes);
      await api.register(customerRoutes);
      await api.register(staffRoutes);
      await api.register(courierRoutes);
      await api.register(mediaRoutes);
      await api.register(auditRoutes);
      await api.register(notificationRoutes);
    },
    { prefix: '/api/v1' },
  );

  return app;
}
