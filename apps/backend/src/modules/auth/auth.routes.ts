import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateWithTelegram, getUserRoles } from './auth.service.js';
import { requireAuth } from './auth.middleware.js';

interface TelegramAuthBody {
  initData: string;
  storeSlug?: string;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /auth/telegram
   * Authenticate via Telegram Mini App initData.
   * Returns JWT token + user info + roles.
   */
  app.post<{ Body: TelegramAuthBody }>(
    '/telegram',
    async (request: FastifyRequest<{ Body: TelegramAuthBody }>, reply: FastifyReply) => {
      const { initData, storeSlug } = request.body;

      const { user, isNew } = await authenticateWithTelegram(initData);

      const roles = await getUserRoles(user.id);

      // Generate JWT using Fastify's @fastify/jwt decorator
      const token = app.jwt.sign(
        {
          userId: user.id,
          telegramId: Number(user.telegramId),
          platformRole: user.platformRole ?? undefined,
        },
        { expiresIn: '7d' },
      );

      return reply.status(isNew ? 201 : 200).send({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          telegramUsername: user.telegramUsername,
        },
        roles,
      });
    },
  );

  /**
   * GET /auth/me
   * Returns the currently authenticated user's info + roles.
   */
  app.get(
    '/me',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      const { userId } = request.currentUser;

      const roles = await getUserRoles(userId);

      return {
        user: {
          id: userId,
          telegramId: request.currentUser.telegramId,
          platformRole: request.currentUser.platformRole,
        },
        roles,
      };
    },
  );
}
