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
    where: { accountId_slug: { accountId: account.id, slug: 'it-i-robototexnika' } },
    update: {
      name: 'IT и робототехника',
      icon: 'it',
      sortOrder: 0,
    },
    create: {
      accountId: account.id,
      name: 'IT и робототехника',
      slug: 'it-i-robototexnika',
      icon: 'it',
      sortOrder: 0,
    },
  });

  const category2 = await prisma.serviceCategory.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'yazyki-i-kommunikaciya' } },
    update: {
      name: 'Языки и коммуникация',
      icon: 'language',
      sortOrder: 1,
    },
    create: {
      accountId: account.id,
      name: 'Языки и коммуникация',
      slug: 'yazyki-i-kommunikaciya',
      icon: 'language',
      sortOrder: 1,
    },
  });

  const category3 = await prisma.serviceCategory.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'tvorchestvo-i-proekty' } },
    update: {
      name: 'Творчество и проекты',
      icon: 'creative',
      sortOrder: 2,
    },
    create: {
      accountId: account.id,
      name: 'Творчество и проекты',
      slug: 'tvorchestvo-i-proekty',
      icon: 'creative',
      sortOrder: 2,
    },
  });

  console.log('✅ Created 3 service categories');

  // IT и робототехника
  const itServices = [
    { name: 'Робототехника Junior (7-9 лет)', price: 28000, unit: 'месяц', priceNote: '₸/месяц' },
    { name: 'Python Start (10-12 лет)', price: 32000, unit: 'месяц' },
    { name: 'GameDev основы', price: 35000, unit: 'месяц' },
    { name: 'Scratch проекты', price: 24000, unit: 'месяц' },
    { name: '3D-моделирование для детей', price: 30000, unit: 'месяц' },
    { name: 'Инженерные проекты', price: 38000, unit: 'месяц' },
    { name: 'Алгоритмика PRO', price: 40000, unit: 'месяц' },
    { name: 'Электроника и IoT', price: 36000, unit: 'месяц' },
    { name: 'Клуб олимпиадного программирования', price: 45000, unit: 'месяц' },
  ];

  for (let i = 0; i < itServices.length; i++) {
    await prisma.service.upsert({
      where: { categoryId_name: { categoryId: category1.id, name: itServices[i].name } },
      update: {},
      create: {
        categoryId: category1.id,
        accountId: account.id,
        ...itServices[i],
        sortOrder: i,
      },
    });
  }

  // Языки и коммуникация
  const languageServices = [
    { name: 'Английский Kids A1', price: 26000, unit: 'месяц' },
    { name: 'Английский Kids A2', price: 29000, unit: 'месяц' },
    { name: 'Разговорный клуб', price: 18000, unit: 'месяц' },
    { name: 'Подготовка к школе', price: 25000, unit: 'месяц' },
    { name: 'Публичные выступления', price: 22000, unit: 'месяц' },
    { name: 'Дебаты для подростков', price: 24000, unit: 'месяц' },
    { name: 'Креативное письмо', price: 21000, unit: 'месяц' },
    { name: 'Чтение и понимание текста', price: 20000, unit: 'месяц' },
    { name: 'Грамматика без стресса', price: 19500, unit: 'месяц' },
  ];

  for (let i = 0; i < languageServices.length; i++) {
    await prisma.service.upsert({
      where: { categoryId_name: { categoryId: category2.id, name: languageServices[i].name } },
      update: {},
      create: {
        categoryId: category2.id,
        accountId: account.id,
        ...languageServices[i],
        sortOrder: i,
      },
    });
  }

  const creativeServices = [
    { name: 'Арт-студия', price: 19000, unit: 'месяц' },
    { name: 'Дизайн-мышление', price: 23000, unit: 'месяц' },
    { name: 'Проектная мастерская', price: 26000, unit: 'месяц' },
    { name: 'Медиа-лаборатория', price: 27000, unit: 'месяц' },
  ];

  for (let i = 0; i < creativeServices.length; i++) {
    await prisma.service.upsert({
      where: { categoryId_name: { categoryId: category3.id, name: creativeServices[i].name } },
      update: {},
      create: {
        categoryId: category3.id,
        accountId: account.id,
        ...creativeServices[i],
        sortOrder: i,
      },
    });
  }

  console.log('✅ Created education catalog services across 3 categories');

  // Mechanic role + sample deal with work logs
  const mechanicPasswordHash = await bcrypt.hash('mechanic123', 10);
  const mechanicUser = await prisma.user.upsert({
    where: { email: 'mechanic@kinder.kz' },
    update: {},
    create: {
      email: 'mechanic@kinder.kz',
      passwordHash: mechanicPasswordHash,
      firstName: 'Ivan',
      lastName: 'Teacher',
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
      name: 'Иван Преподаватель',
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
      title: 'Консультация по программе Python Start',
      stage: 'in_progress',
      amount: 0,
      assignedResourceId: mechanicResource.id,
      metadata: {
        childAge: 10,
      },
    },
  });

  await prisma.workLog.createMany({
    data: [
      {
        accountId: account.id,
        dealId: demoDeal.id,
        resourceId: mechanicResource.id,
        title: 'Первичная консультация',
        description: 'Собрали цели семьи и образовательные интересы ребенка',
        status: 'open',
      },
      {
        accountId: account.id,
        dealId: demoDeal.id,
        resourceId: mechanicResource.id,
        title: 'Диагностика навыков',
        description: 'Оценили текущий уровень и рекомендовали учебную траекторию',
        status: 'open',
        checklist: [
          { text: 'Определить стартовый уровень', done: true },
          { text: 'Подобрать группу по расписанию', done: false },
        ] as any,
      },
    ],
  });

  const stemProgram = await prisma.program.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'stem-start' } },
    update: {
      name: 'STEM Start',
      description: 'Программа для развития инженерного и алгоритмического мышления',
      isActive: true,
    },
    create: {
      accountId: account.id,
      name: 'STEM Start',
      slug: 'stem-start',
      description: 'Программа для развития инженерного и алгоритмического мышления',
      isActive: true,
    },
  });

  const pythonCourse = await prisma.course.upsert({
    where: { accountId_slug: { accountId: account.id, slug: 'python-start' } },
    update: {
      programId: stemProgram.id,
      name: 'Python Start',
      level: 'beginner',
      ageMin: 10,
      ageMax: 12,
      durationWeeks: 24,
      price: 32000,
      isActive: true,
    },
    create: {
      accountId: account.id,
      programId: stemProgram.id,
      name: 'Python Start',
      slug: 'python-start',
      level: 'beginner',
      ageMin: 10,
      ageMax: 12,
      durationWeeks: 24,
      price: 32000,
      isActive: true,
    },
  });

  const springCohort = await prisma.cohort.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {
      accountId: account.id,
      courseId: pythonCourse.id,
      name: 'Python Start — Spring 2026',
      status: 'active',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      accountId: account.id,
      courseId: pythonCourse.id,
      name: 'Python Start — Spring 2026',
      startsAt: new Date('2026-03-15T10:00:00.000Z'),
      endsAt: new Date('2026-06-15T10:00:00.000Z'),
      capacity: 16,
      status: 'active',
      timezone: 'Asia/Almaty',
    },
  });

  const demoFamily = await prisma.family.create({
    data: {
      accountId: account.id,
      name: 'Семья Demo',
      phone: client.phone,
      email: client.email ?? undefined,
      notes: 'Seeded demo family',
    },
  });

  await prisma.familyGuardian.upsert({
    where: {
      familyId_userId: {
        familyId: demoFamily.id,
        userId: client.id,
      },
    },
    update: {
      relationLabel: 'parent',
      isPrimary: true,
    },
    create: {
      familyId: demoFamily.id,
      userId: client.id,
      relationLabel: 'parent',
      isPrimary: true,
    },
  });

  const demoStudent = await prisma.student.create({
    data: {
      accountId: account.id,
      familyId: demoFamily.id,
      firstName: 'Алиса',
      lastName: 'Демо',
      grade: '5',
      schoolName: 'Школа №1',
    },
  });

  await prisma.enrollment.create({
    data: {
      accountId: account.id,
      familyId: demoFamily.id,
      studentId: demoStudent.id,
      courseId: pythonCourse.id,
      cohortId: springCohort.id,
      leadId: demoLead.id,
      dealId: demoDeal.id,
      status: 'active',
      startsAt: new Date('2026-03-15T10:00:00.000Z'),
      notes: 'Seeded enrollment from CRM demo deal',
    },
  });

  console.log('✅ Added demo EdTech entities and connected CRM -> enrollment flow');

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
