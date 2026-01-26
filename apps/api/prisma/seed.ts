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

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Admin: admin@kinder.kz / admin123');
  console.log('   Manager: manager@kinder.kz / manager123');
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
