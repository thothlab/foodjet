import { z } from 'zod';

export const createStoreSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z
    .object({
      deliveryText: z.string().optional(),
      cashPaymentMessage: z.string().optional(),
      supportPhone: z.string().max(32).optional(),
      supportTelegram: z.string().max(64).optional(),
      noticeText: z.string().optional(),
      orderAcceptanceEnabled: z.boolean().optional(),
      minOrderAmount: z.number().int().min(0).optional(),
    })
    .optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export const updateStoreSettingsSchema = z.object({
  deliveryText: z.string().optional(),
  cashPaymentMessage: z.string().optional(),
  supportPhone: z.string().max(32).optional(),
  supportTelegram: z.string().max(64).optional(),
  noticeText: z.string().optional(),
  orderAcceptanceEnabled: z.boolean().optional(),
  minOrderAmount: z.number().int().min(0).nullable().optional(),
});

export const updateWorkingHoursSchema = z.array(
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    closeTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  }),
);

export const toggleStoreStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'TEMPORARILY_CLOSED']),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
export type UpdateWorkingHoursInput = z.infer<typeof updateWorkingHoursSchema>;
export type ToggleStoreStatusInput = z.infer<typeof toggleStoreStatusSchema>;
