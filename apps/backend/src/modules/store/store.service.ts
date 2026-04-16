import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../common/errors.js';
import type {
  CreateStoreInput,
  UpdateStoreInput,
  UpdateStoreSettingsInput,
  UpdateWorkingHoursInput,
} from './store.schemas.js';
import type { StoreStatus } from '@prisma/client';

// ----------------------------------------------------------------
// Public
// ----------------------------------------------------------------

/**
 * Resolve a store by its slug. Throws NotFoundError if not found.
 */
export async function resolveStoreBySlug(slug: string) {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: { settings: true },
  });

  if (!store) {
    throw new NotFoundError('Store', slug);
  }

  return store;
}

/**
 * Bootstrap payload for the Mini App: store + settings + isOpen.
 */
export async function getStoreBootstrap(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      settings: true,
      workingHours: true,
    },
  });

  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  const isOpen = checkStoreOpen(store.workingHours, store.status);

  return {
    store: {
      id: store.id,
      slug: store.slug,
      name: store.name,
      description: store.description,
      status: store.status,
    },
    settings: store.settings,
    isOpen,
    workingHours: store.workingHours,
  };
}

/**
 * Check if a store is currently open based on working hours and status.
 */
export async function isStoreOpen(storeId: string): Promise<boolean> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { workingHours: true },
  });

  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  return checkStoreOpen(store.workingHours, store.status);
}

// ----------------------------------------------------------------
// Admin — CRUD
// ----------------------------------------------------------------

/**
 * Paginated list of stores (admin).
 */
export async function listStores(page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { settings: true },
    }),
    prisma.store.count(),
  ]);

  return {
    data: stores,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Create a store with optional initial settings.
 */
export async function createStore(data: CreateStoreInput) {
  const store = await prisma.store.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      settings: data.settings
        ? { create: data.settings }
        : { create: {} },
    },
    include: { settings: true },
  });

  return store;
}

/**
 * Update core store fields.
 */
export async function updateStore(id: string, data: UpdateStoreInput) {
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) {
    throw new NotFoundError('Store', id);
  }

  return prisma.store.update({
    where: { id },
    data,
    include: { settings: true },
  });
}

/**
 * Update store settings (upsert).
 */
export async function updateStoreSettings(storeId: string, data: UpdateStoreSettingsInput) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  return prisma.storeSettings.upsert({
    where: { storeId },
    update: data,
    create: {
      storeId,
      ...data,
    },
  });
}

/**
 * Toggle store status (ACTIVE / INACTIVE / TEMPORARILY_CLOSED).
 */
export async function toggleStoreStatus(storeId: string, status: StoreStatus) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  return prisma.store.update({
    where: { id: storeId },
    data: { status },
  });
}

// ----------------------------------------------------------------
// Working hours
// ----------------------------------------------------------------

/**
 * Get working hours for a store.
 */
export async function getWorkingHours(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  return prisma.workingHours.findMany({
    where: { storeId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

/**
 * Replace all working hours for a store.
 */
export async function updateWorkingHours(storeId: string, hours: UpdateWorkingHoursInput) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new NotFoundError('Store', storeId);
  }

  // Replace all in a transaction
  await prisma.$transaction([
    prisma.workingHours.deleteMany({ where: { storeId } }),
    ...hours.map((h) =>
      prisma.workingHours.create({
        data: {
          storeId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
        },
      }),
    ),
  ]);

  return prisma.workingHours.findMany({
    where: { storeId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

interface WorkingHoursRow {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

function checkStoreOpen(workingHours: WorkingHoursRow[], status: string): boolean {
  // If the store is not ACTIVE, it's closed
  if (status !== 'ACTIVE') {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const todayHours = workingHours.find((h) => h.dayOfWeek === currentDay);

  if (!todayHours) {
    return false; // no working hours defined for today
  }

  return currentTime >= todayHours.openTime && currentTime < todayHours.closeTime;
}
