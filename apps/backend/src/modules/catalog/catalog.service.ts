import { prisma } from '../../config/database.js';
import { NotFoundError, BusinessError, ValidationError } from '../../common/errors.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateProductInput,
  UpdateProductInput,
} from './catalog.schemas.js';

// ── Categories ───────────────────────────────────────────────

export async function listCategories(
  storeId: string,
  options: { includeInactive?: boolean } = {},
) {
  const statusFilter = options.includeInactive
    ? { status: { in: ['ACTIVE' as const, 'INACTIVE' as const] } }
    : { status: 'ACTIVE' as const };

  return prisma.category.findMany({
    where: { storeId, ...statusFilter },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createCategory(storeId: string, data: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      storeId,
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updateCategory(categoryId: string, data: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new NotFoundError('Category', categoryId);

  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
}

export async function deleteCategory(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new NotFoundError('Category', categoryId);

  const activeProductCount = await prisma.product.count({
    where: { categoryId, status: 'ACTIVE' },
  });

  if (activeProductCount > 0) {
    throw new BusinessError(
      'CATEGORY_HAS_ACTIVE_PRODUCTS',
      `Cannot archive category: it has ${activeProductCount} active product(s). Move or archive them first.`,
    );
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: { status: 'ARCHIVED' },
  });
}

// ── Products ─────────────────────────────────────────────────

export async function listProducts(
  storeId: string,
  options: { categoryId?: string; status?: string; page: number; pageSize: number },
) {
  const where: Record<string, unknown> = { storeId };
  if (options.categoryId) where.categoryId = options.categoryId;
  if (options.status) {
    where.status = options.status;
  } else {
    where.status = 'ACTIVE';
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page: options.page,
    pageSize: options.pageSize,
    totalPages: Math.ceil(total / options.pageSize),
  };
}

export async function getProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) throw new NotFoundError('Product', productId);
  return product;
}

export async function createProduct(storeId: string, data: CreateProductInput) {
  if (data.price <= 0) {
    throw new ValidationError('Price must be a positive integer');
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category || category.storeId !== storeId) {
    throw new NotFoundError('Category', data.categoryId);
  }

  return prisma.product.create({
    data: {
      storeId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      oldPrice: data.oldPrice,
      imageUrl: data.imageUrl,
      tags: data.tags ?? [],
      sortOrder: data.sortOrder ?? 0,
    },
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function updateProduct(productId: string, data: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product', productId);

  return prisma.product.update({
    where: { id: productId },
    data,
    include: { category: { select: { id: true, name: true } } },
  });
}

export async function deleteProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product', productId);

  return prisma.product.update({
    where: { id: productId },
    data: { status: 'ARCHIVED' },
  });
}

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product', productId);

  return prisma.product.update({
    where: { id: productId },
    data: { isAvailable },
  });
}

export async function searchProducts(
  storeId: string,
  query: string,
  options: { page: number; pageSize: number },
) {
  const where = {
    storeId,
    status: 'ACTIVE' as const,
    OR: [
      { name: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page: options.page,
    pageSize: options.pageSize,
    totalPages: Math.ceil(total / options.pageSize),
  };
}
