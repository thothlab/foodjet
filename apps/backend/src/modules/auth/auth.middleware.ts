import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../../common/errors.js';
import { prisma } from '../../config/database.js';

// ----------------------------------------------------------------
// Module augmentation — adds currentUser to every FastifyRequest
// ----------------------------------------------------------------
declare module 'fastify' {
  interface FastifyRequest {
    currentUser: {
      userId: string;
      telegramId: number;
      platformRole?: string;
    };
  }
}

/**
 * Pre-handler hook that verifies the JWT from the Authorization header
 * (Bearer <token>) and attaches the decoded payload to request.currentUser.
 */
export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    // app.jwt.verify is decorated by @fastify/jwt on the request
    const payload = await request.jwtVerify<{
      userId: string;
      telegramId: number;
      platformRole?: string;
    }>();

    request.currentUser = {
      userId: payload.userId,
      telegramId: payload.telegramId,
      platformRole: payload.platformRole,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Returns a pre-handler that checks whether the current user has one of
 * the required platform roles.
 *
 * Usage: `{ preHandler: [requireAuth, requireRole(['SUPER_ADMIN'])] }`
 */
export function requireRole(roles: string[]) {
  return async function roleGuard(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const { currentUser } = request;

    if (!currentUser) {
      throw new UnauthorizedError('Authentication required');
    }

    if (currentUser.platformRole && roles.includes(currentUser.platformRole)) {
      return; // allowed
    }

    throw new ForbiddenError('Insufficient permissions');
  };
}

/**
 * Returns a pre-handler that checks whether the current user has access
 * to a specific store. Access is granted if:
 *  - user is a SUPER_ADMIN, OR
 *  - user has an active StaffAssignment for that store
 *
 * @param storeIdParam - the name of the route parameter that holds the storeId
 */
export function requireStoreAccess(storeIdParam: string = 'storeId') {
  return async function storeAccessGuard(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const { currentUser } = request;

    if (!currentUser) {
      throw new UnauthorizedError('Authentication required');
    }

    // Super admins can access any store
    if (currentUser.platformRole === 'SUPER_ADMIN') {
      return;
    }

    const storeId = (request.params as Record<string, string>)[storeIdParam];

    if (!storeId) {
      throw new ForbiddenError('Store identifier missing');
    }

    const assignment = await prisma.staffAssignment.findFirst({
      where: {
        userId: currentUser.userId,
        storeId,
        status: 'ACTIVE',
      },
    });

    if (!assignment) {
      throw new ForbiddenError('You do not have access to this store');
    }
  };
}
