import { z } from 'zod';

export const inlineAddressSchema = z.object({
  street: z.string().min(1).max(512),
  entrance: z.string().max(16).optional(),
  floor: z.string().max(16).optional(),
  apartment: z.string().max(32).optional(),
  comment: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().uuid().optional(),
  inlineAddress: inlineAddressSchema.optional(),
  contactPhone: z.string().min(1).max(32),
  contactName: z.string().min(1).max(128),
  orderComment: z.string().max(1000).optional(),
  substitutionPolicy: z.enum(['ALLOW', 'CONTACT_ME', 'DO_NOT_SUBSTITUTE']),
});

export const transitionSchema = z.object({
  toStatus: z.string().min(1),
  note: z.string().max(1000).optional(),
});

export const assignCourierSchema = z.object({
  courierId: z.string().uuid(),
});

export const substitutionSchema = z.object({
  action: z.enum(['remove', 'substitute']),
  note: z.string().max(1000).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(1000),
});

export const orderQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type TransitionInput = z.infer<typeof transitionSchema>;
export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
export type SubstitutionInput = z.infer<typeof substitutionSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
