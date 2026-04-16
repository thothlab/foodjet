import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
