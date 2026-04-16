import { prisma } from '../../config/database.js';
import { NotFoundError, BusinessError, ValidationError } from '../../common/errors.js';

// ── Cart lifecycle ───────────────────────────────────────────

export async function getOrCreateCart(customerId: string, storeId: string) {
  const existing = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { customerId, storeId },
  });
}

export async function getCart(customerId: string, storeId: string) {
  const cart = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              oldPrice: true,
              imageUrl: true,
              isAvailable: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return null;

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return { ...cart, total };
}

// ── Item operations ──────────────────────────────────────────

export async function addItem(
  customerId: string,
  storeId: string,
  productId: string,
  quantity: number,
) {
  // Validate product belongs to store, is active and available
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.storeId !== storeId) {
    throw new NotFoundError('Product', productId);
  }
  if (product.status !== 'ACTIVE') {
    throw new BusinessError('PRODUCT_NOT_ACTIVE', 'Product is not active');
  }
  if (!product.isAvailable) {
    throw new BusinessError('PRODUCT_UNAVAILABLE', 'Product is currently unavailable');
  }

  const cart = await getOrCreateCart(customerId, storeId);

  // Upsert: if item already exists, add to quantity
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { product: { select: { id: true, name: true, price: true } } },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
    include: { product: { select: { id: true, name: true, price: true } } },
  });
}

export async function updateItemQuantity(
  customerId: string,
  storeId: string,
  productId: string,
  quantity: number,
) {
  if (quantity < 1) {
    throw new ValidationError('Quantity must be at least 1');
  }

  const cart = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
  });
  if (!cart) throw new NotFoundError('Cart');

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!item) throw new NotFoundError('CartItem');

  return prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    include: { product: { select: { id: true, name: true, price: true } } },
  });
}

export async function removeItem(
  customerId: string,
  storeId: string,
  productId: string,
) {
  const cart = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
  });
  if (!cart) throw new NotFoundError('Cart');

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!item) throw new NotFoundError('CartItem');

  return prisma.cartItem.delete({ where: { id: item.id } });
}

export async function clearCart(customerId: string, storeId: string) {
  const cart = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
  });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

// ── Totals & validation ──────────────────────────────────────

export async function getCartTotal(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: { select: { price: true } } },
  });

  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export async function validateCart(customerId: string, storeId: string) {
  const cart = await prisma.cart.findUnique({
    where: { customerId_storeId: { customerId, storeId } },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              isAvailable: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { valid: true, unavailableItems: [] };
  }

  const unavailableItems = cart.items
    .filter(
      (item) => !item.product.isAvailable || item.product.status !== 'ACTIVE',
    )
    .map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      reason: item.product.status !== 'ACTIVE' ? 'not_active' : 'unavailable',
    }));

  return {
    valid: unavailableItems.length === 0,
    unavailableItems,
  };
}
