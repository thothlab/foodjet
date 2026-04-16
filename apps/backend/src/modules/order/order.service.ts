import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import {
  NotFoundError,
  ValidationError,
  BusinessError,
  ForbiddenError,
} from '../../common/errors.js';
import type { CreateOrderInput } from './order.schemas.js';
import type { OrderStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Order status transition map
// ---------------------------------------------------------------------------

const ORDER_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ASSEMBLING', 'CANCELLED'],
  ASSEMBLING: ['AWAITING_SUBSTITUTION_DECISION', 'READY_FOR_DELIVERY', 'CANCELLED'],
  AWAITING_SUBSTITUTION_DECISION: ['ASSEMBLING', 'READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['ASSIGNED_TO_COURIER', 'CANCELLED'],
  ASSIGNED_TO_COURIER: ['IN_DELIVERY', 'READY_FOR_DELIVERY', 'CANCELLED'],
  IN_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Allowed actor types per transition target status.
 * 'system' is always implicitly allowed.
 */
const ACTOR_TRANSITION_MAP: Record<string, string[]> = {
  CONFIRMED: ['staff', 'system'],
  ASSEMBLING: ['staff', 'system'],
  AWAITING_SUBSTITUTION_DECISION: ['staff', 'system'],
  READY_FOR_DELIVERY: ['staff', 'system'],
  ASSIGNED_TO_COURIER: ['staff', 'system'],
  IN_DELIVERY: ['courier', 'staff', 'system'],
  DELIVERED: ['courier', 'staff', 'system'],
  CANCELLED: ['customer', 'staff', 'system'],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = ORDER_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function canActorTransition(actorType: string, toStatus: string): boolean {
  if (actorType === 'system') return true;
  const allowed = ACTOR_TRANSITION_MAP[toStatus];
  return allowed ? allowed.includes(actorType) : false;
}

// ---------------------------------------------------------------------------
// Order number generation
// ---------------------------------------------------------------------------

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `FJ-${y}${m}${d}-${rand}`;
}

// ---------------------------------------------------------------------------
// Create order from cart
// ---------------------------------------------------------------------------

export async function createOrderFromCart(
  customerId: string,
  storeId: string,
  input: CreateOrderInput,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Load cart with items
    const cart = await tx.cart.findUnique({
      where: { customerId_storeId: { customerId, storeId } },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // 2. Validate store is open and accepting orders
    const store = await tx.store.findUnique({
      where: { id: storeId },
      include: { settings: true, workingHours: true },
    });

    if (!store) {
      throw new NotFoundError('Store', storeId);
    }

    if (store.status !== 'ACTIVE') {
      throw new BusinessError('STORE_CLOSED', 'Store is currently not active');
    }

    if (store.settings && !store.settings.orderAcceptanceEnabled) {
      throw new BusinessError('ORDERS_DISABLED', 'Store is not accepting orders at the moment');
    }

    // Check working hours
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todayHours = store.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
    if (todayHours && (currentTime < todayHours.openTime || currentTime >= todayHours.closeTime)) {
      throw new BusinessError('STORE_CLOSED', 'Store is currently closed');
    }

    // 3. Validate all items are available
    for (const cartItem of cart.items) {
      if (!cartItem.product.isAvailable || cartItem.product.status !== 'ACTIVE') {
        throw new BusinessError(
          'ITEM_UNAVAILABLE',
          `Product "${cartItem.product.name}" is no longer available`,
          { productId: cartItem.product.id },
        );
      }
    }

    // 4. Build delivery address string
    let deliveryAddress: string;
    let deliveryComment: string | undefined;

    if (input.addressId) {
      const address = await tx.address.findUnique({ where: { id: input.addressId } });
      if (!address) {
        throw new NotFoundError('Address', input.addressId);
      }
      deliveryAddress = [
        address.street,
        address.entrance ? `подъезд ${address.entrance}` : null,
        address.floor ? `этаж ${address.floor}` : null,
        address.apartment ? `кв. ${address.apartment}` : null,
      ]
        .filter(Boolean)
        .join(', ');
      deliveryComment = address.comment ?? undefined;
    } else if (input.inlineAddress) {
      deliveryAddress = [
        input.inlineAddress.street,
        input.inlineAddress.entrance ? `подъезд ${input.inlineAddress.entrance}` : null,
        input.inlineAddress.floor ? `этаж ${input.inlineAddress.floor}` : null,
        input.inlineAddress.apartment ? `кв. ${input.inlineAddress.apartment}` : null,
      ]
        .filter(Boolean)
        .join(', ');
      deliveryComment = input.inlineAddress.comment;
    } else {
      throw new ValidationError('Either addressId or inlineAddress must be provided');
    }

    // 5. Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    // Check minimum order amount
    if (store.settings?.minOrderAmount && subtotal < store.settings.minOrderAmount) {
      throw new BusinessError(
        'MIN_ORDER_AMOUNT',
        `Minimum order amount is ${store.settings.minOrderAmount}`,
        { minAmount: store.settings.minOrderAmount, currentAmount: subtotal },
      );
    }

    // 6. Create order
    const orderNumber = generateOrderNumber();

    const order = await tx.order.create({
      data: {
        orderNumber,
        storeId,
        customerId,
        addressId: input.addressId ?? null,
        status: 'NEW',
        deliveryAddress,
        deliveryComment: deliveryComment ?? null,
        contactPhone: input.contactPhone,
        contactName: input.contactName,
        orderComment: input.orderComment ?? null,
        substitutionPolicy: input.substitutionPolicy,
        subtotal,
        deliveryFee,
        total,
        items: {
          create: cart.items.map((cartItem) => ({
            productId: cartItem.productId,
            productName: cartItem.product.name,
            productPrice: cartItem.product.price,
            quantity: cartItem.quantity,
            total: cartItem.product.price * cartItem.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 7. Record initial status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: 'NEW',
        actorId: customerId,
        actorType: 'customer',
        note: 'Order created',
      },
    });

    // 8. Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    logger.info({ orderId: order.id, orderNumber }, 'Order created');

    return order;
  });
}

// ---------------------------------------------------------------------------
// Get order
// ---------------------------------------------------------------------------

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      history: { orderBy: { createdAt: 'asc' } },
      address: true,
      courier: {
        include: {
          user: {
            select: { firstName: true, lastName: true, phone: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order', orderId);
  }

  return order;
}

// ---------------------------------------------------------------------------
// Get order for customer (only if they own it)
// ---------------------------------------------------------------------------

export async function getOrderForCustomer(orderId: string, customerId: string) {
  const order = await getOrder(orderId);

  if (order.customerId !== customerId) {
    throw new ForbiddenError('You do not have access to this order');
  }

  return order;
}

// ---------------------------------------------------------------------------
// List orders for customer (paginated)
// ---------------------------------------------------------------------------

export async function listOrdersForCustomer(
  customerId: string,
  opts: { page?: number; pageSize?: number },
) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;

  const where = { customerId };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.order.count({ where }),
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
// List orders for store (paginated, with optional status filter)
// ---------------------------------------------------------------------------

export async function listOrdersForStore(
  storeId: string,
  opts: { status?: string; page?: number; pageSize?: number },
) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;

  const where: Record<string, unknown> = { storeId };
  if (opts.status) {
    where.status = opts.status as OrderStatus;
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: true,
        customer: {
          include: {
            user: { select: { firstName: true, lastName: true, telegramUsername: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
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
// Transition order status
// ---------------------------------------------------------------------------

export async function transitionStatus(
  orderId: string,
  toStatus: string,
  actorId: string,
  actorType: string,
  note?: string,
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order', orderId);
  }

  const fromStatus = order.status;

  if (!isValidTransition(fromStatus, toStatus)) {
    throw new BusinessError(
      'INVALID_TRANSITION',
      `Cannot transition from ${fromStatus} to ${toStatus}`,
      { fromStatus, toStatus },
    );
  }

  if (!canActorTransition(actorType, toStatus)) {
    throw new ForbiddenError(
      `Actor type "${actorType}" cannot perform transition to ${toStatus}`,
    );
  }

  if (toStatus === 'CANCELLED' && !note) {
    throw new ValidationError('Cancel reason is required when transitioning to CANCELLED');
  }

  const updateData: Record<string, unknown> = {
    status: toStatus as OrderStatus,
  };

  if (toStatus === 'DELIVERED') {
    updateData.deliveredAt = new Date();
  }

  if (toStatus === 'CANCELLED') {
    updateData.cancelReason = note;
    updateData.cancelledBy = actorId;
  }

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true, history: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: fromStatus as OrderStatus,
        toStatus: toStatus as OrderStatus,
        actorId,
        actorType,
        note: note ?? null,
      },
    }),
  ]);

  logger.info(
    { orderId, fromStatus, toStatus, actorId, actorType },
    'Order status transitioned',
  );

  return updatedOrder;
}

// ---------------------------------------------------------------------------
// Assign courier
// ---------------------------------------------------------------------------

export async function assignCourier(orderId: string, courierId: string, actorId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order', orderId);
  }

  if (order.status !== 'READY_FOR_DELIVERY') {
    throw new BusinessError(
      'INVALID_STATUS',
      `Order must be in READY_FOR_DELIVERY status to assign a courier (current: ${order.status})`,
    );
  }

  const courier = await prisma.courier.findUnique({ where: { id: courierId } });

  if (!courier) {
    throw new NotFoundError('Courier', courierId);
  }

  if (courier.status !== 'ACTIVE') {
    throw new BusinessError('COURIER_INACTIVE', 'Courier is not active');
  }

  if (courier.storeId !== order.storeId) {
    throw new BusinessError(
      'COURIER_WRONG_STORE',
      'Courier does not belong to this store',
    );
  }

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        courierId,
        status: 'ASSIGNED_TO_COURIER',
      },
      include: { items: true, history: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: 'READY_FOR_DELIVERY',
        toStatus: 'ASSIGNED_TO_COURIER',
        actorId,
        actorType: 'staff',
        note: `Courier ${courierId} assigned`,
      },
    }),
  ]);

  logger.info({ orderId, courierId, actorId }, 'Courier assigned to order');

  return updatedOrder;
}

// ---------------------------------------------------------------------------
// Handle substitution
// ---------------------------------------------------------------------------

export async function handleSubstitution(
  orderId: string,
  itemId: string,
  action: 'remove' | 'substitute',
  note?: string,
  actorId?: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new NotFoundError('Order', orderId);
  }

  const item = order.items.find((i) => i.id === itemId);
  if (!item) {
    throw new NotFoundError('OrderItem', itemId);
  }

  if (action === 'remove') {
    // Mark item as removed and recalculate totals
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: itemId },
        data: { isRemoved: true },
      });

      // Recalculate totals excluding removed items
      const remainingItems = order.items.filter(
        (i) => i.id !== itemId && !i.isRemoved,
      );
      const newSubtotal = remainingItems.reduce((sum, i) => sum + i.total, 0);
      const newTotal = newSubtotal + order.deliveryFee;

      await tx.order.update({
        where: { id: orderId },
        data: { subtotal: newSubtotal, total: newTotal },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: order.status,
          actorId: actorId ?? null,
          actorType: 'staff',
          note: `Item "${item.productName}" removed from order`,
        },
      });
    });
  } else {
    // Mark item as substituted
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: itemId },
        data: {
          isSubstituted: true,
          substituteNote: note ?? null,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: order.status,
          actorId: actorId ?? null,
          actorType: 'staff',
          note: `Item "${item.productName}" substituted${note ? `: ${note}` : ''}`,
        },
      });
    });
  }

  logger.info({ orderId, itemId, action, actorId }, 'Substitution handled');

  return getOrder(orderId);
}

// ---------------------------------------------------------------------------
// Reorder from previous order
// ---------------------------------------------------------------------------

export async function reorderFromPrevious(
  orderId: string,
  customerId: string,
  storeId: string,
) {
  const previousOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!previousOrder) {
    throw new NotFoundError('Order', orderId);
  }

  if (previousOrder.customerId !== customerId) {
    throw new ForbiddenError('You do not have access to this order');
  }

  const addedItems: Array<{ productId: string; productName: string; quantity: number }> = [];
  const unavailableItems: Array<{ productId: string; productName: string; reason: string }> = [];

  // Get or create cart for this store
  let cart = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId, storeId },
    });
  }

  for (const item of previousOrder.items) {
    if (item.isRemoved) {
      unavailableItems.push({
        productId: item.productId,
        productName: item.productName,
        reason: 'Item was removed in the original order',
      });
      continue;
    }

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || product.status !== 'ACTIVE' || !product.isAvailable) {
      unavailableItems.push({
        productId: item.productId,
        productName: item.productName,
        reason: !product ? 'Product no longer exists' : 'Product is unavailable',
      });
      continue;
    }

    // Upsert cart item
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      update: { quantity: item.quantity },
      create: {
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      },
    });

    addedItems.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
    });
  }

  logger.info(
    { orderId, customerId, addedCount: addedItems.length, unavailableCount: unavailableItems.length },
    'Reorder from previous order',
  );

  return { addedItems, unavailableItems };
}

// ---------------------------------------------------------------------------
// Cancel order
// ---------------------------------------------------------------------------

export async function cancelOrder(
  orderId: string,
  actorId: string,
  actorType: string,
  reason: string,
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order', orderId);
  }

  if (!isValidTransition(order.status, 'CANCELLED')) {
    throw new BusinessError(
      'CANCEL_NOT_ALLOWED',
      `Cannot cancel order in status ${order.status}`,
      { currentStatus: order.status },
    );
  }

  if (!canActorTransition(actorType, 'CANCELLED')) {
    throw new ForbiddenError(
      `Actor type "${actorType}" cannot cancel orders`,
    );
  }

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledBy: actorId,
      },
      include: { items: true, history: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: 'CANCELLED',
        actorId,
        actorType,
        note: reason,
      },
    }),
  ]);

  logger.info({ orderId, actorId, actorType, reason }, 'Order cancelled');

  return updatedOrder;
}
