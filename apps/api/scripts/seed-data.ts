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
        'Yaris',
        'Avensis',
        'Auris',
        'Verso',
        'Land Cruiser Prado',
        '4Runner',
        'Sequoia',
        'Sienna',
        'Tundra',
        'Tacoma',
        'Venza',
        'C-HR',
        'Supra',
        'Avalon',
        'Crown',
        'Harrier',
        'Vellfire',
        'Noah',
        'Voxy',
        'Estima',
        '86',
        'Celica',
        'Matrix',
        'FJ Cruiser',
      ],
    },
    {
      name: 'Lexus',
      models: [
        'RX',
        'ES',
        'LX',
        'NX',
        'IS',
        'GX',
        'LS',
        'UX',
        'RC',
        'LC',
        'GS',
        'CT',
        'HS',
        'SC',
      ],
    },
    {
      name: 'Mercedes-Benz',
      models: [
        'E-Class',
        'S-Class',
        'C-Class',
        'GLE',
        'GLS',
        'GLB',
        'GLA',
        'A-Class',
        'G-Class',
        'CLS',
        'SL',
        'SLC',
        'AMG GT',
        'EQC',
        'EQS',
        'EQE',
        'V-Class',
        'Sprinter',
        'Vito',
        'Maybach',
        'B-Class',
        'CLA',
        'GLK',
        'ML-Class',
        'R-Class',
      ],
    },
    {
      name: 'BMW',
      models: [
        '3 Series',
        '5 Series',
        '7 Series',
        'X5',
        'X3',
        'X7',
        'X1',
        'X2',
        'X4',
        'X6',
        '2 Series',
        '4 Series',
        '6 Series',
        '8 Series',
        'Z4',
        'i3',
        'i4',
        'iX',
        '1 Series',
        'M3',
        'M5',
        'X3 M',
        'X5 M',
      ],
    },
    {
      name: 'Audi',
      models: [
        'A4',
        'A6',
        'Q7',
        'Q5',
        'A3',
        'Q3',
        'Q8',
        'A5',
        'A7',
        'A8',
        'Q2',
        'TT',
        'R8',
        'e-tron',
        'A1',
        'S4',
        'S5',
        'S6',
        'RS3',
        'RS5',
        'RS6',
        'Q4 e-tron',
      ],
    },
    {
      name: 'Volkswagen',
      models: [
        'Polo',
        'Passat',
        'Tiguan',
        'Touareg',
        'Jetta',
        'Golf',
        'Arteon',
        'Teramont',
        'Atlas',
        'Amarok',
        'Caddy',
        'Transporter',
        'Caravelle',
        'Touran',
        'Sharan',
        'Beetle',
        'Scirocco',
        'ID.3',
        'ID.4',
        'ID.5',
      ],
    },
    {
      name: 'Hyundai',
      models: [
        'Solaris',
        'Elantra',
        'Tucson',
        'Santa Fe',
        'Creta',
        'Accent',
        'Sonata',
        'Palisade',
        'Kona',
        'Venue',
        'Ioniq',
        'Nexo',
        'Staria',
        'i30',
        'i20',
        'Veloster',
        'Genesis',
        'Grandeur',
        'ix35',
        'Terracan',
      ],
    },
    {
      name: 'Kia',
      models: [
        'Rio',
        'Sportage',
        'Sorento',
        'Cerato',
        'K5',
        'Picanto',
        'Seltos',
        'Telluride',
        'Carnival',
        'Stinger',
        'EV6',
        'Niro',
        'Soul',
        'Optima',
        'Cadenza',
        'Mohave',
        'Venga',
        'Ceed',
        'Proceed',
        'Stonic',
      ],
    },
    {
      name: 'Nissan',
      models: [
        'Qashqai',
        'X-Trail',
        'Patrol',
        'Murano',
        'Almera',
        'Juke',
        'Kicks',
        'Rogue',
        'Pathfinder',
        'Armada',
        'Frontier',
        'Titan',
        'Leaf',
        'Ariya',
        'GT-R',
        'Sentra',
        'Altima',
        'Maxima',
        'Terrano',
        '370Z',
        'Note',
        'Micra',
        'Navara',
      ],
    },
    {
      name: 'Honda',
      models: [
        'Accord',
        'CR-V',
        'Civic',
        'HR-V',
        'Pilot',
        'Fit',
        'Insight',
        'Ridgeline',
        'Passport',
        'Odyssey',
        'Clarity',
        'City',
        'Jazz',
        'FR-V',
        'Element',
        'CR-Z',
        'S2000',
        'NSX',
      ],
    },
    {
      name: 'Mazda',
      models: [
        'CX-5',
        'Mazda3',
        'Mazda6',
        'CX-9',
        'CX-30',
        'Mazda2',
        'MX-5',
        'CX-3',
        'CX-7',
        'CX-8',
        'CX-50',
        'CX-60',
        'CX-90',
        'RX-8',
        'MX-30',
        'Premacy',
        'Atenza',
        'Axela',
      ],
    },
    {
      name: 'Chevrolet',
      models: [
        'Cruze',
        'Malibu',
        'Tahoe',
        'Suburban',
        'Traverse',
        'Spark',
        'Bolt',
        'Equinox',
        'Blazer',
        'Silverado',
        'Camaro',
        'Corvette',
        'Colorado',
        'Trax',
        'Captiva',
        'Aveo',
        'Impala',
        'Volt',
      ],
    },
    {
      name: 'Ford',
      models: [
        'Focus',
        'Mondeo',
        'Explorer',
        'Mustang',
        'F-150',
        'Fiesta',
        'Fusion',
        'Escape',
        'Edge',
        'Expedition',
        'Ranger',
        'Raptor',
        'Bronco',
        'Maverick',
        'Mustang Mach-E',
        'EcoSport',
        'Kuga',
        'Transit',
        'Galaxy',
        'S-MAX',
        'GT',
      ],
    },
    {
      name: 'Skoda',
      models: [
        'Octavia',
        'Superb',
        'Kodiaq',
        'Karoq',
        'Rapid',
        'Fabia',
        'Scala',
        'Kamiq',
        'Enyaq',
        'Yeti',
        'Roomster',
        'Citigo',
      ],
    },
    {
      name: 'Lada',
      models: [
        'Granta',
        'Vesta',
        'Largus',
        'Niva',
        'XRAY',
        'Kalina',
        'Priora',
        '2107',
        '2114',
        '2115',
        '2110',
        'Samara',
      ],
    },
    {
      name: 'UAZ',
      models: [
        'Patriot',
        'Hunter',
        'Pickup',
        '3962',
        '469',
        'Profi',
        'Cargo',
      ],
    },
    {
      name: 'Mitsubishi',
      models: [
        'Outlander',
        'Pajero',
        'ASX',
        'L200',
        'Eclipse Cross',
        'Lancer',
        'Galant',
        'Montero',
        'Mirage',
        'Attrage',
        'Xpander',
        'Pajero Sport',
        'Delica',
        'Colt',
        'Grandis',
        'Carisma',
      ],
    },
    {
      name: 'Subaru',
      models: [
        'Outback',
        'Forester',
        'XV',
        'Impreza',
        'Legacy',
        'WRX',
        'BRZ',
        'Ascent',
        'Crosstrek',
        'Tribeca',
        'Levorg',
        'Exiga',
        'STI',
      ],
    },
    {
      name: 'Volvo',
      models: [
        'XC90',
        'XC60',
        'S90',
        'V90',
        'XC40',
        'S60',
        'V60',
        'V40',
        'V50',
        'C30',
        'C40',
        'C70',
        'S80',
        'V70',
        'XC70',
        'S40',
      ],
    },
    {
      name: 'Land Rover',
      models: [
        'Range Rover',
        'Discovery',
        'Defender',
        'Evoque',
        'Freelander',
        'Velar',
        'Sport',
        'Range Rover Sport',
        'Discovery Sport',
        'LR2',
        'LR3',
        'LR4',
      ],
    },
    {
      name: 'Chery',
      models: [
        'Tiggo 4',
        'Tiggo 7',
        'Tiggo 8',
        'Arrizo 6',
        'Arrizo 7',
        'Tiggo 3',
        'Tiggo 5',
        'Tiggo 2',
        'Exeed TXL',
        'Exeed LX',
        'Amulet',
        'Bonus',
        'Fora',
        'QQ',
        'Very',
      ],
    },
    {
      name: 'Geely',
      models: [
        'Coolray',
        'Atlas',
        'Emgrand',
        'Tugella',
        'Monjaro',
        'Atlas Pro',
        'Okavango',
        'GC6',
        'X7',
        'MK',
        'Emgrand X7',
        'Vision',
        'Preface',
      ],
    },
    {
      name: 'Haval',
      models: [
        'Jolion',
        'F7',
        'H6',
        'H9',
        'Dargo',
        'F7x',
        'H2',
        'H5',
        'M6',
        'H4',
        'Concept H',
      ],
    },
    {
      name: 'BYD',
      models: [
        'Tang',
        'Han',
        'Qin',
        'Song',
        'Yuan',
        'Atto 3',
        'Seal',
        'Dolphin',
        'E2',
        'E3',
        'F3',
        'G6',
        'S6',
      ],
    },
  ];

  console.log('Seeding vehicle brands and models...');
  for (const brandData of brands) {
    // Use uppercase brand name as ID (e.g., "TOYOTA", "BMW")
    const brandId = brandData.name.toUpperCase().replace(/\s+/g, '_');

    const brand = await prisma.vehicleBrand.upsert({
      where: { id: brandId },
      update: { name: brandData.name },
      create: {
        id: brandId,
        name: brandData.name,
        popular: true, // Mark all as popular for now
      },
    });

    for (const modelName of brandData.models) {
      const modelId = `${brandId}_${modelName.toUpperCase().replace(/\s+/g, '_')}`;

      await prisma.vehicleModel.upsert({
        where: { id: modelId },
        update: { name: modelName },
        create: {
          id: modelId,
          name: modelName,
          brandId: brand.id,
        },
      });
    }

    console.log(`✓ ${brandData.name} (${brandData.models.length} models)`);
  }

  // Service categories
  const serviceCategories = [
    { slug: 'brakes', name: 'Тормозная система', icon: '🛑', sortOrder: 1 },
    { slug: 'cooling_system', name: 'Система охлаждения', icon: '❄️', sortOrder: 2 },
  ];

  // Service types (auto repair services)
  const services = [
    // Тормозная система
    { name: 'Проточка тормозных дисков', categorySlug: 'brakes', price: 16000 },
    { name: 'Замена главного тормозного цилиндра (ГТЦ)', categorySlug: 'brakes', price: 15000 },
    { name: 'Замена тормозной жидкости', categorySlug: 'brakes', price: 5000 },
    { name: 'Замена тормозных колодок (передние)', categorySlug: 'brakes', price: 4000 },
    { name: 'Замена задних колодок с электронным ручником', categorySlug: 'brakes', price: 6000 },
    { name: 'Замена барабанных колодок', categorySlug: 'brakes', price: 7000 },
    { name: 'Ремонт суппорта (1-поршневой)', categorySlug: 'brakes', price: 6000 },
    { name: 'Ремонт суппорта (2-поршневой)', categorySlug: 'brakes', price: 7000 },
    { name: 'Ремонт суппорта (4-поршневой)', categorySlug: 'brakes', price: 9000 },

    // Система охлаждения
    { name: 'Замена антифриза', categorySlug: 'cooling_system', price: 5000 },
    { name: 'Замена антифриза с продувкой', categorySlug: 'cooling_system', price: 7000 },
    { name: 'Замена термостата', categorySlug: 'cooling_system', price: 5000 },
    { name: 'Промывка системы охлаждения — блок двигателя', categorySlug: 'cooling_system', price: 10000 },
    { name: 'Промывка системы охлаждения — основной радиатор', categorySlug: 'cooling_system', price: 10000 },
    { name: 'Промывка системы охлаждения — радиатор отопителя', categorySlug: 'cooling_system', price: 12000 },
    { name: 'Замена основного радиатора', categorySlug: 'cooling_system', price: 15000 },
    { name: 'Замена радиатора отопителя', categorySlug: 'cooling_system', price: 25000 },
  ];

  console.log('\nSeeding service categories and services...');
  // Get first account for services (assuming at least one account exists)
  const account = await prisma.account.findFirst();
  if (!account) {
    throw new Error('No account found. Please create an account first.');
  }

  // Create categories first
  const categoryMap = new Map<string, string>(); // slug -> categoryId
  for (const catData of serviceCategories) {
    const category = await prisma.serviceCategory.upsert({
      where: {
        accountId_slug: {
          accountId: account.id,
          slug: catData.slug,
        },
      },
      update: {
        name: catData.name,
        icon: catData.icon,
        sortOrder: catData.sortOrder,
      },
      create: {
        accountId: account.id,
        slug: catData.slug,
        name: catData.name,
        icon: catData.icon,
        sortOrder: catData.sortOrder,
      },
    });
    categoryMap.set(catData.slug, category.id);
    console.log(`✓ Category: ${catData.name}`);
  }

  // Create services
  for (const service of services) {
    const categoryId = categoryMap.get(service.categorySlug);
    if (!categoryId) {
      console.warn(`⚠️  Category not found: ${service.categorySlug}, skipping ${service.name}`);
      continue;
    }

    await prisma.service.upsert({
      where: {
        categoryId_name: {
          categoryId: categoryId,
          name: service.name,
        },
      },
      update: {
        price: service.price,
      },
      create: {
        name: service.name,
        categoryId: categoryId,
        accountId: account.id,
        price: service.price,
      },
    });
    console.log(`✓ ${service.name} - ${service.price} тг`);
  }

  console.log('\n✅ Seed data created successfully!');
  console.log(`   - ${brands.length} brands`);
  console.log(
    `   - ${brands.reduce((sum, b) => sum + b.models.length, 0)} models`
  );
  console.log(`   - ${serviceCategories.length} service categories`);
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
