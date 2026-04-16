import { prisma } from '../../config/database.js';
import { NotFoundError, BusinessError } from '../../common/errors.js';
import { recordAudit } from '../audit/audit.service.js';
import type { StoreRole, AssignmentStatus } from '@prisma/client';

export async function listStaffAssignments(storeId: string) {
  return prisma.staffAssignment.findMany({
    where: { storeId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, telegramUsername: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function assignStaff(
  storeId: string,
  data: { userId: string; role: StoreRole },
  actorId: string,
) {
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new NotFoundError('User', data.userId);

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new NotFoundError('Store', storeId);

  const existing = await prisma.staffAssignment.findUnique({
    where: { userId_storeId_role: { userId: data.userId, storeId, role: data.role } },
  });

  if (existing) {
    if (existing.status === 'ACTIVE') {
      throw new BusinessError('ALREADY_ASSIGNED', 'User is already assigned to this role in this store');
    }
    // Reactivate
    const assignment = await prisma.staffAssignment.update({
      where: { id: existing.id },
      data: { status: 'ACTIVE' },
    });
    await recordAudit({
      entityType: 'staff_assignment',
      entityId: assignment.id,
      action: 'reactivate',
      actorId,
      actorType: 'user',
      metadata: { storeId, userId: data.userId, role: data.role },
    });
    return assignment;
  }

  const assignment = await prisma.staffAssignment.create({
    data: {
      userId: data.userId,
      storeId,
      role: data.role,
    },
  });

  await recordAudit({
    entityType: 'staff_assignment',
    entityId: assignment.id,
    action: 'assign',
    actorId,
    actorType: 'user',
    metadata: { storeId, userId: data.userId, role: data.role },
  });

  return assignment;
}

export async function revokeStaffAssignment(assignmentId: string, actorId: string) {
  const assignment = await prisma.staffAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new NotFoundError('StaffAssignment', assignmentId);

  const updated = await prisma.staffAssignment.update({
    where: { id: assignmentId },
    data: { status: 'INACTIVE' as AssignmentStatus },
  });

  await recordAudit({
    entityType: 'staff_assignment',
    entityId: assignmentId,
    action: 'revoke',
    actorId,
    actorType: 'user',
    metadata: { storeId: assignment.storeId, userId: assignment.userId, role: assignment.role },
  });

  return updated;
}

export async function findUserByTelegramUsername(username: string) {
  return prisma.user.findFirst({
    where: { telegramUsername: username },
  });
}
