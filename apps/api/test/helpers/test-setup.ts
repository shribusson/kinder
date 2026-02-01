import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma.service';

/**
 * Test database setup and teardown helpers
 */
export class TestDatabase {
  private static prisma: PrismaService;

  static async setup(): Promise<PrismaService> {
    if (!this.prisma) {
      this.prisma = new PrismaService();
      await this.prisma.$connect();
    }
    return this.prisma;
  }

  static async teardown(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  static async cleanup(): Promise<void> {
    if (!this.prisma) return;

    // Delete in order respecting foreign key constraints
    const tablesToClean = [
      'Message',
      'Conversation',
      'Lead',
      'Deal',
      'Booking',
      'RefreshToken',
      'Session',
      'Membership',
      'User',
      'Account',
    ];

    for (const table of tablesToClean) {
      try {
        await (this.prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
      } catch (error) {
        // Ignore errors for tables that might not exist or have data
      }
    }
  }
}

/**
 * JWT Token generation helper for testing
 */
export function generateTestToken(
  jwtService: JwtService,
  payload: { sub: string; email: string; id?: string },
): string {
  return jwtService.sign({
    sub: payload.sub,
    email: payload.email,
    id: payload.id || payload.sub,
  });
}

/**
 * Create a configured NestJS test application
 */
export async function createTestApp(
  moduleFixture: TestingModule,
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Mock PrismaService factory for unit tests
 */
export function createMockPrismaService() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    conversation: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    message: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    lead: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    deal: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    mediaFile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((fn) => fn()),
  };
}

/**
 * Mock JwtService factory for unit tests
 */
export function createMockJwtService() {
  return {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-id', email: 'test@example.com' }),
    decode: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
  };
}

/**
 * Mock ConfigService factory for unit tests
 */
export function createMockConfigService() {
  return {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        JWT_SECRET: 'test-jwt-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_EXPIRES_IN: '7d',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        REDIS_URL: 'redis://localhost:6379',
      };
      return config[key];
    }),
    getOrThrow: jest.fn((key: string) => {
      const value = createMockConfigService().get(key);
      if (!value) throw new Error(`Missing config: ${key}`);
      return value;
    }),
  };
}

/**
 * Mock Bull Queue factory for unit tests
 */
export function createMockQueue() {
  return {
    add: jest.fn().mockResolvedValue({ id: 'job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    getJob: jest.fn(),
    getJobs: jest.fn().mockResolvedValue([]),
    getJobCounts: jest.fn().mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    }),
  };
}
