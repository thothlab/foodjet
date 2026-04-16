import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { bot } from './bot.js';
import type { NotificationType, NotificationStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Notification templates
// ---------------------------------------------------------------------------

interface TemplateData {
  orderNumber?: string;
  total?: number;
  [key: string]: unknown;
}

const TEMPLATES: Record<string, (data: TemplateData) => string> = {
  ORDER_NEW: (d) =>
    `🛒 Новый заказ #${d.orderNumber}! Сумма: ${d.total} руб.`,
  ORDER_CONFIRMED: (d) =>
    `✅ Заказ #${d.orderNumber} подтверждён.`,
  ORDER_ASSEMBLING: (d) =>
    `📦 Заказ #${d.orderNumber} собирается.`,
  ORDER_COURIER_ASSIGNED: (d) =>
    `🚗 Курьер назначен на заказ #${d.orderNumber}.`,
  ORDER_IN_DELIVERY: (d) =>
    `🚚 Заказ #${d.orderNumber} в пути!`,
  ORDER_DELIVERED: (d) =>
    `✅ Заказ #${d.orderNumber} доставлен. Спасибо!`,
  ORDER_CANCELLED: (d) =>
    `❌ Заказ #${d.orderNumber} отменён.`,
  ORDER_SUBSTITUTION_NEEDED: (d) =>
    `⚠️ В заказе #${d.orderNumber} требуется замена товара.`,
};

// ---------------------------------------------------------------------------
// Get notification template
// ---------------------------------------------------------------------------

export function getNotificationTemplate(type: string, data: TemplateData): string {
  const templateFn = TEMPLATES[type];
  if (!templateFn) {
    return `Уведомление: ${type}`;
  }
  return templateFn(data);
}

// ---------------------------------------------------------------------------
// Send Telegram message
// ---------------------------------------------------------------------------

export async function sendTelegramMessage(
  telegramId: number | bigint,
  text: string,
): Promise<void> {
  try {
    await bot.api.sendMessage(Number(telegramId), text, { parse_mode: 'HTML' });
  } catch (error: unknown) {
    const errorObj = error as { description?: string };
    // Handle "bot blocked by user" and similar Telegram API errors
    if (
      errorObj.description &&
      (errorObj.description.includes('bot was blocked') ||
        errorObj.description.includes('user is deactivated') ||
        errorObj.description.includes('chat not found'))
    ) {
      logger.warn({ telegramId, error: errorObj.description }, 'Telegram send failed — user unavailable');
      throw new TelegramSendError(errorObj.description);
    }
    logger.error({ telegramId, error }, 'Failed to send Telegram message');
    throw error;
  }
}

class TelegramSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelegramSendError';
  }
}

// ---------------------------------------------------------------------------
// Send notification (main entry point)
// ---------------------------------------------------------------------------

export async function sendNotification(
  type: string,
  recipientId: string,
  payload: TemplateData,
): Promise<void> {
  const text = getNotificationTemplate(type, payload);

  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      type: type as NotificationType,
      recipientId,
      channel: 'TELEGRAM',
      payload: payload as Record<string, unknown>,
      status: 'PENDING',
    },
  });

  // Resolve the recipient's Telegram ID
  const user = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { telegramId: true },
  });

  if (!user?.telegramId) {
    logger.warn({ recipientId, notificationId: notification.id }, 'Recipient has no Telegram ID');
    await markNotification(notification.id, 'FAILED', 'Recipient has no Telegram ID');
    return;
  }

  // Attempt to send
  try {
    await sendTelegramMessage(user.telegramId, text);
    await markNotification(notification.id, 'SENT');
    logger.info(
      { notificationId: notification.id, type, recipientId },
      'Notification sent',
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await markNotification(notification.id, 'FAILED', errorMessage);
    logger.error(
      { notificationId: notification.id, type, recipientId, error: errorMessage },
      'Notification send failed',
    );
  }
}

// ---------------------------------------------------------------------------
// Send notification to store staff
// ---------------------------------------------------------------------------

export async function sendStaffNotification(
  storeId: string,
  type: string,
  payload: TemplateData,
): Promise<void> {
  // Find all active staff managers for the store
  const staffAssignments = await prisma.staffAssignment.findMany({
    where: {
      storeId,
      status: 'ACTIVE',
      role: { in: ['STORE_MANAGER', 'STORE_OPERATOR'] },
    },
    select: { userId: true },
  });

  // Send notification to each staff member
  const sendPromises = staffAssignments.map((assignment) =>
    sendNotification(type, assignment.userId, payload).catch((error) => {
      logger.error(
        { userId: assignment.userId, type, error },
        'Failed to send staff notification',
      );
    }),
  );

  await Promise.allSettled(sendPromises);
}

// ---------------------------------------------------------------------------
// List notifications (admin)
// ---------------------------------------------------------------------------

export async function listNotifications(
  storeId: string,
  opts: { page?: number; pageSize?: number },
) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 50;

  // Get all users associated with this store (customers who ordered + staff)
  const storeStaff = await prisma.staffAssignment.findMany({
    where: { storeId, status: 'ACTIVE' },
    select: { userId: true },
  });

  const staffUserIds = storeStaff.map((s) => s.userId);

  const where = {
    recipientId: { in: staffUserIds },
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function markNotification(
  id: string,
  status: NotificationStatus,
  errorMessage?: string,
): Promise<void> {
  await prisma.notification.update({
    where: { id },
    data: {
      status,
      sentAt: status === 'SENT' ? new Date() : undefined,
      errorMessage: errorMessage ?? null,
    },
  });
}
