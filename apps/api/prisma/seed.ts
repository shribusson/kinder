import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default account
  const account = await prisma.account.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Kinder Education Center',
      domain: 'kinder.kz',
      plan: 'enterprise',
      settings: {
        timezone: 'Asia/Almaty',
        currency: 'KZT',
        locale: 'ru',
      },
    },
  });
  console.log('✅ Created default account:', account.name);

  // Create superadmin user
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kinder.kz' },
    update: {},
    create: {
      email: 'admin@kinder.kz',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.superadmin,
      accountId: account.id,
      locale: 'ru',
    },
  });
  console.log('✅ Created admin user:', admin.email);
  console.log('   Password:', adminPassword === 'admin123' ? 'admin123 (change immediately!)' : '****** (from env)');

  // Create membership for admin
  await prisma.membership.upsert({
    where: {
      userId_accountId: {
        userId: admin.id,
        accountId: account.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      accountId: account.id,
      role: UserRole.superadmin,
      permissions: {
        all: true,
      },
    },
  });
  console.log('✅ Created admin membership');

  // Create sample manager
  const managerPasswordHash = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@kinder.kz' },
    update: {},
    create: {
      email: 'manager@kinder.kz',
      passwordHash: managerPasswordHash,
      firstName: 'Manager',
      lastName: 'User',
      role: UserRole.manager,
      accountId: account.id,
      locale: 'ru',
    },
  });
  console.log('✅ Created manager user:', manager.email);
  console.log('   Password: manager123');

  // Create membership for manager
  await prisma.membership.upsert({
    where: {
      userId_accountId: {
        userId: manager.id,
        accountId: account.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      accountId: account.id,
      role: UserRole.manager,
      permissions: {
        crm: true,
        leads: true,
        deals: true,
        bookings: true,
        campaigns: true,
        analytics: true,
      },
    },
  });
  console.log('✅ Created manager membership');

  // Create sample client
  const clientPasswordHash = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: clientPasswordHash,
      firstName: 'Test',
      lastName: 'Client',
      phone: '+77001234567',
      role: UserRole.client,
      locale: 'ru',
    },
  });
  console.log('✅ Created test client:', client.email);
  console.log('   Password: client123');

  // Create sample sales plan
  await prisma.salesPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      accountId: account.id,
      period: '2026-01',
      target: 500000,
      metadata: {
        month: 'January',
        year: 2026,
      },
    },
  });
  console.log('✅ Created sample sales plan');

  // Create sample product
  const product = await prisma.product.create({
    data: {
      accountId: account.id,
      type: 'webinar',
      name: 'Развитие ребенка: первые шаги',
      description: 'Вебинар для родителей детей от 0 до 3 лет',
      price: 5000,
      currency: 'KZT',
      isActive: true,
    },
  });
  console.log('✅ Created sample product:', product.name);

  // Create service categories and services
  const category1 = await prisma.serviceCategory.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'tormozna-sistema' } },
    update: {},
    create: {
      accountId: account.id,
      name: 'Тормозная система',
      slug: 'tormozna-sistema',
      icon: 'brake',
      sortOrder: 0,
    },
  });

  const category2 = await prisma.serviceCategory.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'sistema-ohlazhdenia' } },
    update: {},
    create: {
      accountId: account.id,
      name: 'Система охлаждения',
      slug: 'sistema-ohlazhdenia',
      icon: 'coolant',
      sortOrder: 1,
    },
  });

  const category3 = await prisma.serviceCategory.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'sistema-otopleniya' } },
    update: {},
    create: {
      accountId: account.id,
      name: 'Система отопления',
      slug: 'sistema-otopleniya',
      icon: 'heater',
      sortOrder: 2,
    },
  });

  console.log('✅ Created 3 service categories');

  // Brake system services
  const brakeServices = [
    { name: 'Проточка дисков', price: 16000, unit: 'ось', priceNote: 'тг/ось' },
    { name: 'Замена главного тормозного цилиндра (ГТЦ)', price: 15000 },
    { name: 'Замена тормозной жидкости', price: 5000 },
    { name: 'Замена тормозных колодок (передние)', price: 4000 },
    { name: 'Замена задних колодок с электронным ручником', price: 6000 },
    { name: 'Замена барабанных колодок', price: 7000 },
    { name: 'Ремонт суппорта (1-поршневой)', price: 6000 },
    { name: 'Ремонт суппорта (2-поршневой)', price: 7000 },
    { name: 'Ремонт суппорта (4-поршневой)', price: 9000 },
  ];

  for (let i = 0; i < brakeServices.length; i++) {
    await prisma.service.upsert({
      where: { categoryId_name: { categoryId: category1.id, name: brakeServices[i].name } },
      update: {},
      create: {
        categoryId: category1.id,
        accountId: account.id,
        ...brakeServices[i],
        sortOrder: i,
      },
    });
  }

  // Cooling system services
  const coolingServices = [
    { name: 'Замена антифриза', price: 5000 },
    { name: 'Замена антифриза с продувкой', price: 7000 },
    { name: 'Замена термостата', price: null, priceNote: 'от 5 000 тг (зависит от сложности)' },
    { name: 'Промывка системы охлаждения — блок двигателя', price: 10000 },
    { name: 'Промывка системы охлаждения — основной радиатор', price: 10000 },
    { name: 'Промывка системы охлаждения — радиатор отопителя', price: 12000 },
    { name: 'Замена основного радиатора', price: 15000 },
    { name: 'Замена радиатора отопителя', price: null, priceNote: '25 000 – 40 000 тг' },
    { name: 'Промывка радиатора отопителя', price: null, priceNote: 'по запросу' },
  ];

  for (let i = 0; i < coolingServices.length; i++) {
    await prisma.service.upsert({
      where: { categoryId_name: { categoryId: category2.id, name: coolingServices[i].name } },
      update: {},
      create: {
        categoryId: category2.id,
        accountId: account.id,
        ...coolingServices[i],
        sortOrder: i,
      },
    });
  }

  console.log('✅ Created 18 services across 3 categories (9 brake + 9 cooling)');

  // Mechanic role + sample deal with work logs
  const mechanicPasswordHash = await bcrypt.hash('mechanic123', 10);
  const mechanicUser = await prisma.user.upsert({
    where: { email: 'mechanic@kinder.kz' },
    update: {},
    create: {
      email: 'mechanic@kinder.kz',
      passwordHash: mechanicPasswordHash,
      firstName: 'Ivan',
      lastName: 'Mechanic',
      role: UserRole.mechanic,
      accountId: account.id,
      locale: 'ru',
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_accountId: {
        userId: mechanicUser.id,
        accountId: account.id,
      },
    },
    update: {},
    create: {
      userId: mechanicUser.id,
      accountId: account.id,
      role: UserRole.mechanic,
      permissions: {
        crm: true,
        deals: true,
      },
    },
  });

  const mechanicResource = await prisma.resource.upsert({
    where: { userId: mechanicUser.id },
    update: {},
    create: {
      accountId: account.id,
      userId: mechanicUser.id,
      name: 'Иван Механик',
      type: 'specialist',
      email: mechanicUser.email,
      phone: '+77001112233',
    },
  });

  const demoLead = await prisma.lead.create({
    data: {
      accountId: account.id,
      name: 'Demo Client',
      phone: '+77005556677',
      source: 'seed',
    },
  });

  const demoDeal = await prisma.deal.create({
    data: {
      accountId: account.id,
      leadId: demoLead.id,
      title: 'Диагностика подвески',
      stage: 'in_progress',
      amount: 0,
      assignedResourceId: mechanicResource.id,
      metadata: {
        licensePlate: '123ABC01',
      },
    },
  });

  await prisma.workLog.createMany({
    data: [
      {
        accountId: account.id,
        dealId: demoDeal.id,
        resourceId: mechanicResource.id,
        title: 'Прием авто',
        description: 'Осмотр внешних повреждений, фото кузова',
        status: 'open',
      },
      {
        accountId: account.id,
        dealId: demoDeal.id,
        resourceId: mechanicResource.id,
        title: 'Диагностика подвески',
        description: 'Проверка стоек, втулок стабилизатора, шаровых',
        status: 'open',
        checklist: [
          { text: 'Передние стойки', done: false },
          { text: 'Втулки стабилизатора', done: true },
        ] as any,
      },
    ],
  });

  console.log('✅ Added mechanic user, resource and demo deal with work logs');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Admin: admin@kinder.kz / admin123');
  console.log('   Manager: manager@kinder.kz / manager123');
  console.log('   Mechanic: mechanic@kinder.kz / mechanic123');
  console.log('   Client: client@example.com / client123');
  console.log('\n⚠️  Change these passwords immediately in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
