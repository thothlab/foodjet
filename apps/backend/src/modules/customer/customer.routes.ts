import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  getOrCreateProfile,
  updateProfile,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from './customer.service.js';

const updateProfileSchema = z.object({
  phone: z.string().max(32).optional(),
});

const createAddressSchema = z.object({
  title: z.string().max(128).optional(),
  street: z.string().min(1).max(512),
  entrance: z.string().max(16).optional(),
  floor: z.string().max(16).optional(),
  apartment: z.string().max(32).optional(),
  comment: z.string().max(1000).optional(),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = createAddressSchema.partial();

export async function customerRoutes(app: FastifyInstance) {
  // Get or create profile
  app.get('/profile', {
    preHandler: [app.authenticate],
  }, async (request) => {
    return getOrCreateProfile(request.currentUser.userId);
  });

  // Update profile
  app.put('/profile', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const data = updateProfileSchema.parse(request.body);
    return updateProfile(request.currentUser.userId, data);
  });

  // List addresses
  app.get('/addresses', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const profile = await getOrCreateProfile(request.currentUser.userId);
    return { data: await listAddresses(profile.id) };
  });

  // Create address
  app.post('/addresses', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const profile = await getOrCreateProfile(request.currentUser.userId);
    const data = createAddressSchema.parse(request.body);
    const address = await createAddress(profile.id, data);
    reply.status(201).send(address);
  });

  // Update address
  app.put('/addresses/:addressId', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const { addressId } = request.params as { addressId: string };
    const profile = await getOrCreateProfile(request.currentUser.userId);
    const data = updateAddressSchema.parse(request.body);
    return updateAddress(addressId, profile.id, data);
  });

  // Delete address
  app.delete('/addresses/:addressId', {
    preHandler: [app.authenticate],
  }, async (request) => {
    const { addressId } = request.params as { addressId: string };
    const profile = await getOrCreateProfile(request.currentUser.userId);
    await deleteAddress(addressId, profile.id);
    return { success: true };
  });
}
