import { prisma } from '../../config/database.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';

export async function getOrCreateProfile(userId: string) {
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
    include: { addresses: { orderBy: { isDefault: 'desc' } } },
  });

  if (!profile) {
    profile = await prisma.customerProfile.create({
      data: { userId },
      include: { addresses: true },
    });
  }

  return profile;
}

export async function updateProfile(userId: string, data: { phone?: string }) {
  return prisma.customerProfile.update({
    where: { userId },
    data,
  });
}

export async function listAddresses(customerId: string) {
  return prisma.address.findMany({
    where: { customerId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createAddress(
  customerId: string,
  data: {
    title?: string;
    street: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
    comment?: string;
    isDefault?: boolean;
  },
) {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: { customerId, ...data },
  });
}

export async function updateAddress(
  addressId: string,
  customerId: string,
  data: {
    title?: string;
    street?: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
    comment?: string;
    isDefault?: boolean;
  },
) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, customerId },
  });
  if (!address) throw new NotFoundError('Address', addressId);

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { customerId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteAddress(addressId: string, customerId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, customerId },
  });
  if (!address) throw new NotFoundError('Address', addressId);

  return prisma.address.delete({ where: { id: addressId } });
}
