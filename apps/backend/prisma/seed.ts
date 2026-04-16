import { PrismaClient, StoreStatus, UserStatus, PlatformRole, StoreRole, CategoryStatus, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create super admin user
  const admin = await prisma.user.upsert({
    where: { telegramId: 1000000n },
    update: {},
    create: {
      telegramId: 1000000n,
      firstName: 'Admin',
      lastName: 'User',
      status: UserStatus.ACTIVE,
      platformRole: PlatformRole.SUPER_ADMIN,
    },
  });
  console.log('  ✓ Super admin created:', admin.id);

  // 2. Create demo store
  const store = await prisma.store.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      slug: 'demo-store',
      name: 'Demo Store',
      description: 'A demo store for testing',
      status: StoreStatus.ACTIVE,
      settings: {
        create: {
          deliveryText: 'Доставка в пределах города. Время доставки 30-60 минут.',
          cashPaymentMessage: 'Оплата наличными при получении.',
          supportPhone: '+7 (999) 123-45-67',
          supportTelegram: '@demo_support',
          orderAcceptanceEnabled: true,
        },
      },
    },
  });
  console.log('  ✓ Demo store created:', store.id);

  // 3. Create working hours (Mon-Sat 9:00-21:00)
  for (let day = 1; day <= 6; day++) {
    await prisma.workingHours.upsert({
      where: { storeId_dayOfWeek: { storeId: store.id, dayOfWeek: day } },
      update: {},
      create: {
        storeId: store.id,
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '21:00',
      },
    });
  }
  console.log('  ✓ Working hours set (Mon-Sat 9:00-21:00)');

  // 4. Create store manager
  const manager = await prisma.user.upsert({
    where: { telegramId: 2000000n },
    update: {},
    create: {
      telegramId: 2000000n,
      firstName: 'Store',
      lastName: 'Manager',
      status: UserStatus.ACTIVE,
    },
  });
  await prisma.staffAssignment.upsert({
    where: { userId_storeId_role: { userId: manager.id, storeId: store.id, role: StoreRole.STORE_MANAGER } },
    update: {},
    create: {
      userId: manager.id,
      storeId: store.id,
      role: StoreRole.STORE_MANAGER,
    },
  });
  console.log('  ✓ Store manager created:', manager.id);

  // 5. Create courier user
  const courierUser = await prisma.user.upsert({
    where: { telegramId: 3000000n },
    update: {},
    create: {
      telegramId: 3000000n,
      firstName: 'Demo',
      lastName: 'Courier',
      status: UserStatus.ACTIVE,
    },
  });
  await prisma.courier.upsert({
    where: { userId: courierUser.id },
    update: {},
    create: {
      userId: courierUser.id,
      storeId: store.id,
    },
  });
  console.log('  ✓ Courier created:', courierUser.id);

  // 6. Create demo categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { storeId: store.id, name: 'Молочные продукты', sortOrder: 1, status: CategoryStatus.ACTIVE },
    }),
    prisma.category.create({
      data: { storeId: store.id, name: 'Хлеб и выпечка', sortOrder: 2, status: CategoryStatus.ACTIVE },
    }),
    prisma.category.create({
      data: { storeId: store.id, name: 'Фрукты и овощи', sortOrder: 3, status: CategoryStatus.ACTIVE },
    }),
    prisma.category.create({
      data: { storeId: store.id, name: 'Напитки', sortOrder: 4, status: CategoryStatus.ACTIVE },
    }),
  ]);
  console.log('  ✓ Demo categories created:', categories.length);

  // 7. Create demo products
  const products = [
    { categoryId: categories[0].id, name: 'Молоко 3.2%', price: 8900, description: 'Молоко пастеризованное 1л' },
    { categoryId: categories[0].id, name: 'Кефир 1%', price: 7500, description: 'Кефир натуральный 1л' },
    { categoryId: categories[0].id, name: 'Творог 5%', price: 12000, description: 'Творог рассыпчатый 200г' },
    { categoryId: categories[0].id, name: 'Сметана 20%', price: 9500, description: 'Сметана натуральная 300г' },
    { categoryId: categories[1].id, name: 'Хлеб белый', price: 4500, description: 'Хлеб пшеничный нарезной' },
    { categoryId: categories[1].id, name: 'Батон нарезной', price: 5200, description: 'Батон нарезной 400г' },
    { categoryId: categories[1].id, name: 'Булочка с маком', price: 3500, description: 'Булочка сдобная с маком' },
    { categoryId: categories[2].id, name: 'Яблоки Гала', price: 15000, oldPrice: 18000, description: 'Яблоки свежие, 1 кг' },
    { categoryId: categories[2].id, name: 'Бананы', price: 11000, description: 'Бананы спелые, 1 кг' },
    { categoryId: categories[2].id, name: 'Помидоры', price: 22000, description: 'Помидоры свежие, 1 кг' },
    { categoryId: categories[3].id, name: 'Вода минеральная', price: 4500, description: 'Вода минеральная 1.5л' },
    { categoryId: categories[3].id, name: 'Сок апельсиновый', price: 12000, description: 'Сок натуральный 1л' },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: product.categoryId,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        description: product.description,
        status: ProductStatus.ACTIVE,
        isAvailable: true,
      },
    });
  }
  console.log('  ✓ Demo products created:', products.length);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
