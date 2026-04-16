import type { FastifyInstance } from 'fastify';
import { uploadImage } from './media.service.js';

export async function mediaRoutes(app: FastifyInstance) {
  // Upload image (auth + catalog permissions required)
  app.post('/upload/image', {
    preHandler: [app.authenticate, app.requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'])],
  }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      reply.status(400).send({ error: { code: 'NO_FILE', message: 'No file uploaded' } });
      return;
    }

    const url = await uploadImage(data);
    reply.status(201).send({ url });
  });
}
