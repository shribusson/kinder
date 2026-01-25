import "reflect-metadata";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env"),
    path.resolve(process.cwd(), "..", "..", ".env")
  ];
  const envPath = envPaths.find((candidate) => fs.existsSync(candidate));
  if (envPath) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.PUBLIC_SITE_URL,
        process.env.CRM_DOMAIN,
        process.env.CLIENT_DOMAIN,
      ].filter((url): url is string => Boolean(url)),
      credentials: true,
    },
  });

  // Security
  app.use(helmet());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3001);
  console.log(`🚀 API server running on http://localhost:3001`);
}

bootstrap();
