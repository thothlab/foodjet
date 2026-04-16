import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../common/errors.js';
import { verifyTelegramWebAppData } from './telegram-auth.service.js';
import type { TelegramUser } from './telegram-auth.service.js';

export interface AuthenticatedUser {
  id: string;
  telegramId: bigint | null;
  telegramUsername: string | null;
  firstName: string | null;
  lastName: string | null;
  platformRole: string | null;
}

export interface AuthResult {
  user: AuthenticatedUser;
  isNew: boolean;
}

export interface UserRoles {
  platformRole: string | null;
  storeRoles: Array<{
    storeId: string;
    role: string;
    status: string;
  }>;
}

/**
 * Verify Telegram initData, find or create user, and return the user + isNew flag.
 */
export async function authenticateWithTelegram(initData: string): Promise<AuthResult> {
  const telegramUser = verifyTelegramWebAppData(initData, env.TELEGRAM_BOT_TOKEN);

  if (!telegramUser) {
    throw new UnauthorizedError('Invalid Telegram initData');
  }

  return upsertUserFromTelegram(telegramUser);
}

/**
 * Upsert a user from Telegram data and ensure a customer profile exists.
 */
async function upsertUserFromTelegram(tgUser: TelegramUser): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { telegramId: BigInt(tgUser.id) },
  });

  const isNew = !existing;

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(tgUser.id) },
    update: {
      firstName: tgUser.first_name,
      lastName: tgUser.last_name ?? null,
      telegramUsername: tgUser.username ?? null,
    },
    create: {
      telegramId: BigInt(tgUser.id),
      firstName: tgUser.first_name,
      lastName: tgUser.last_name ?? null,
      telegramUsername: tgUser.username ?? null,
      customerProfile: {
        create: {},
      },
    },
  });

  // Ensure customer profile exists (for users created before this logic)
  if (!isNew) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      await prisma.customerProfile.create({
        data: { userId: user.id },
      });
    }
  }

  return {
    user: {
      id: user.id,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      firstName: user.firstName,
      lastName: user.lastName,
      platformRole: user.platformRole,
    },
    isNew,
  };
}

/**
 * Get all roles for a user: platform role + store staff assignments.
 */
export async function getUserRoles(userId: string, storeId?: string): Promise<UserRoles> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      platformRole: true,
      staffAssignments: {
        where: {
          status: 'ACTIVE',
          ...(storeId ? { storeId } : {}),
        },
        select: {
          storeId: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    return { platformRole: null, storeRoles: [] };
  }

  return {
    platformRole: user.platformRole,
    storeRoles: user.staffAssignments.map((a) => ({
      storeId: a.storeId,
      role: a.role,
      status: a.status,
    })),
  };
}
