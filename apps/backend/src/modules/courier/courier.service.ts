import { prisma } from '../../config/database.js';
import { NotFoundError, BusinessError } from '../../common/errors.js';
import { recordAudit } from '../audit/audit.service.js';

export async function listCouriers(storeId: string) {
  return prisma.courier.findMany({
    where: { storeId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, telegramUsername: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listActiveCouriers(storeId: string) {
  return prisma.courier.findMany({
    where: { storeId, status: 'ACTIVE' },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, telegramUsername: true, phone: true },
      },
    },
  });
}

export async function createCourier(
  storeId: string,
  userId: string,
  actorId: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User', userId);

  const existing = await prisma.courier.findUnique({ where: { userId } });
  if (existing) {
    throw new BusinessError('ALREADY_COURIER', 'User is already registered as a courier');
  }

  const courier = await prisma.courier.create({
    data: { userId, storeId },
  });

  await recordAudit({
    entityType: 'courier',
    entityId: courier.id,
    action: 'create',
    actorId,
    actorType: 'user',
    metadata: { storeId, userId },
  });

  return courier;
}

export async function updateCourierStatus(
  courierId: string,
  status: 'ACTIVE' | 'INACTIVE',
  actorId: string,
) {
  const courier = await prisma.courier.findUnique({ where: { id: courierId } });
  if (!courier) throw new NotFoundError('Courier', courierId);

  const updated = await prisma.courier.update({
    where: { id: courierId },
    data: { status },
  });

  await recordAudit({
    entityType: 'courier',
    entityId: courierId,
    action: status === 'ACTIVE' ? 'activate' : 'deactivate',
    actorId,
    actorType: 'user',
  });

  return updated;
}

export async function getCourierByUserId(userId: string) {
  return prisma.courier.findUnique({
    where: { userId },
    include: { store: true },
  });
}
