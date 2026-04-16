import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().int().positive('Price must be a positive integer'),
  oldPrice: z.number().int().positive().optional(),
  imageUrl: z.string().url().max(512).optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().int().positive('Price must be a positive integer').optional(),
  oldPrice: z.number().int().positive().nullable().optional(),
  imageUrl: z.string().url().max(512).nullable().optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(['ACTIVE', 'HIDDEN', 'ARCHIVED']).optional(),
});

export const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const productQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ToggleAvailabilityInput = z.infer<typeof toggleAvailabilitySchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
