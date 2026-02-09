import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial data...');

  // Vehicle brands and models (popular brands in Kazakhstan)
  const brands = [
    {
      name: 'Toyota',
      models: [
        'Camry',
        'Corolla',
        'RAV4',
        'Land Cruiser',
        'Highlander',
        'Prius',
        'Alphard',
        'Fortuner',
      ],
    },
    {
      name: 'Lexus',
      models: ['RX', 'ES', 'LX', 'NX', 'IS', 'GX'],
    },
    {
      name: 'Mercedes-Benz',
      models: ['E-Class', 'S-Class', 'C-Class', 'GLE', 'GLS', 'GLB', 'GLA', 'A-Class'],
    },
    {
      name: 'BMW',
      models: ['3 Series', '5 Series', '7 Series', 'X5', 'X3', 'X7', 'X1'],
    },
    {
      name: 'Audi',
      models: ['A4', 'A6', 'Q7', 'Q5', 'A3', 'Q3'],
    },
    {
      name: 'Volkswagen',
      models: ['Polo', 'Passat', 'Tiguan', 'Touareg', 'Jetta'],
    },
    {
      name: 'Hyundai',
      models: ['Solaris', 'Elantra', 'Tucson', 'Santa Fe', 'Creta'],
    },
    {
      name: 'Kia',
      models: ['Rio', 'Sportage', 'Sorento', 'Cerato', 'K5'],
    },
    {
      name: 'Nissan',
      models: ['Qashqai', 'X-Trail', 'Patrol', 'Murano', 'Almera'],
    },
    {
      name: 'Honda',
      models: ['Accord', 'CR-V', 'Civic', 'HR-V', 'Pilot'],
    },
    {
      name: 'Mazda',
      models: ['CX-5', 'Mazda3', 'Mazda6', 'CX-9', 'CX-30'],
    },
    {
      name: 'Chevrolet',
      models: ['Cruze', 'Malibu', 'Tahoe', 'Suburban', 'Traverse'],
    },
    {
      name: 'Ford',
      models: ['Focus', 'Mondeo', 'Explorer', 'Mustang', 'F-150'],
    },
    {
      name: 'Skoda',
      models: ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Rapid'],
    },
    {
      name: 'Lada',
      models: ['Granta', 'Vesta', 'Largus', 'Niva', 'XRAY'],
    },
    {
      name: 'UAZ',
      models: ['Patriot', 'Hunter', 'Pickup', '3962'],
    },
    {
      name: 'Mitsubishi',
      models: ['Outlander', 'Pajero', 'ASX', 'L200', 'Eclipse Cross'],
    },
    {
      name: 'Subaru',
      models: ['Outback', 'Forester', 'XV', 'Impreza', 'Legacy'],
    },
    {
      name: 'Volvo',
      models: ['XC90', 'XC60', 'S90', 'V90', 'XC40'],
    },
    {
      name: 'Land Rover',
      models: ['Range Rover', 'Discovery', 'Defender', 'Evoque', 'Freelander'],
    },
  ];

  console.log('Seeding vehicle brands and models...');
  for (const brandData of brands) {
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandData.name },
      update: {},
      create: { name: brandData.name },
    });

    for (const modelName of brandData.models) {
      await prisma.vehicleModel.upsert({
        where: {
          brandId_name: {
            brandId: brand.id,
            name: modelName,
          },
        },
        update: {},
        create: {
          name: modelName,
          brandId: brand.id,
        },
      });
    }

    console.log(`✓ ${brandData.name} (${brandData.models.length} models)`);
  }

  // Service types (auto repair services)
  const services = [
    // Диагностика
    { name: 'Компьютерная диагностика', category: 'diagnostics', basePrice: 5000 },
    { name: 'Диагностика подвески', category: 'diagnostics', basePrice: 3000 },
    { name: 'Диагностика двигателя', category: 'diagnostics', basePrice: 4000 },
    { name: 'Диагностика тормозной системы', category: 'diagnostics', basePrice: 2500 },

    // ТО
    { name: 'ТО-1 (5000 км)', category: 'maintenance', basePrice: 15000 },
    { name: 'ТО-2 (10000 км)', category: 'maintenance', basePrice: 20000 },
    { name: 'ТО-3 (15000 км)', category: 'maintenance', basePrice: 25000 },
    { name: 'ТО-4 (20000 км)', category: 'maintenance', basePrice: 30000 },

    // Двигатель
    { name: 'Замена масла и фильтров', category: 'engine', basePrice: 8000 },
    { name: 'Замена ремня ГРМ', category: 'engine', basePrice: 25000 },
    { name: 'Замена свечей зажигания', category: 'engine', basePrice: 5000 },
    { name: 'Замена воздушного фильтра', category: 'engine', basePrice: 2000 },
    { name: 'Промывка инжектора', category: 'engine', basePrice: 12000 },
    { name: 'Раскоксовка двигателя', category: 'engine', basePrice: 15000 },

    // Трансмиссия
    { name: 'Замена масла АКПП', category: 'transmission', basePrice: 18000 },
    { name: 'Замена масла МКПП', category: 'transmission', basePrice: 10000 },
    { name: 'Замена сцепления', category: 'transmission', basePrice: 35000 },
    { name: 'Ремонт АКПП', category: 'transmission', basePrice: 80000 },
    { name: 'Ремонт МКПП', category: 'transmission', basePrice: 50000 },

    // Подвеска
    { name: 'Замена амортизаторов (комплект)', category: 'suspension', basePrice: 40000 },
    { name: 'Замена стоек стабилизатора', category: 'suspension', basePrice: 8000 },
    { name: 'Замена рычагов подвески', category: 'suspension', basePrice: 25000 },
    { name: 'Замена шаровых опор', category: 'suspension', basePrice: 12000 },
    { name: 'Замена сайлентблоков', category: 'suspension', basePrice: 15000 },
    { name: 'Развал-схождение', category: 'suspension', basePrice: 6000 },

    // Тормозная система
    { name: 'Замена тормозных колодок (передние)', category: 'brakes', basePrice: 8000 },
    { name: 'Замена тормозных колодок (задние)', category: 'brakes', basePrice: 7000 },
    { name: 'Замена тормозных дисков (передние)', category: 'brakes', basePrice: 18000 },
    { name: 'Замена тормозных дисков (задние)', category: 'brakes', basePrice: 15000 },
    { name: 'Замена тормозной жидкости', category: 'brakes', basePrice: 5000 },
    { name: 'Прокачка тормозов', category: 'brakes', basePrice: 4000 },

    // Рулевое управление
    { name: 'Замена рулевых наконечников', category: 'steering', basePrice: 10000 },
    { name: 'Замена рулевой тяги', category: 'steering', basePrice: 12000 },
    { name: 'Ремонт рулевой рейки', category: 'steering', basePrice: 30000 },
    { name: 'Замена ГУР насоса', category: 'steering', basePrice: 25000 },

    // Электрика
    { name: 'Замена аккумулятора', category: 'electrical', basePrice: 3000 },
    { name: 'Диагностика электрики', category: 'electrical', basePrice: 5000 },
    { name: 'Замена генератора', category: 'electrical', basePrice: 15000 },
    { name: 'Замена стартера', category: 'electrical', basePrice: 12000 },
    { name: 'Ремонт проводки', category: 'electrical', basePrice: 8000 },

    // Кузовные работы
    { name: 'Покраска элемента кузова', category: 'bodywork', basePrice: 25000 },
    { name: 'Рихтовка', category: 'bodywork', basePrice: 15000 },
    { name: 'Полировка кузова', category: 'bodywork', basePrice: 20000 },
    { name: 'Антикоррозийная обработка', category: 'bodywork', basePrice: 18000 },

    // Шиномонтаж
    { name: 'Шиномонтаж (4 колеса)', category: 'tires', basePrice: 5000 },
    { name: 'Балансировка (4 колеса)', category: 'tires', basePrice: 4000 },
    { name: 'Ремонт проколов', category: 'tires', basePrice: 2000 },
    { name: 'Хранение шин (сезон)', category: 'tires', basePrice: 10000 },

    // Прочее
    { name: 'Мойка автомобиля', category: 'other', basePrice: 3000 },
    { name: 'Химчистка салона', category: 'other', basePrice: 15000 },
    { name: 'Замена лобового стекла', category: 'other', basePrice: 30000 },
    { name: 'Тонировка стекол', category: 'other', basePrice: 20000 },
    { name: 'Установка сигнализации', category: 'other', basePrice: 25000 },
  ];

  console.log('\nSeeding service types...');
  // Get first account for services (assuming at least one account exists)
  const account = await prisma.account.findFirst();
  if (!account) {
    throw new Error('No account found. Please create an account first.');
  }

  for (const service of services) {
    await prisma.service.upsert({
      where: {
        accountId_name: {
          accountId: account.id,
          name: service.name,
        },
      },
      update: {
        category: service.category,
        basePrice: service.basePrice,
      },
      create: {
        name: service.name,
        category: service.category,
        basePrice: service.basePrice,
        accountId: account.id,
      },
    });
    console.log(`✓ ${service.name} - ${service.basePrice} тг`);
  }

  console.log('\n✅ Seed data created successfully!');
  console.log(`   - ${brands.length} brands`);
  console.log(
    `   - ${brands.reduce((sum, b) => sum + b.models.length, 0)} models`
  );
  console.log(`   - ${services.length} services`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
