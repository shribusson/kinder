import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { HealthController } from "./health.controller";
import { CrmModule } from "./crm/crm.module";
import { PrismaModule } from "./prisma.module";
import { AuthModule } from "./auth/auth.module";
import { StorageModule } from "./storage/storage.module";
import { TelephonyModule } from "./telephony/telephony.module";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";
import { TelegramModule } from "./telegram/telegram.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { ServicesModule } from "./services/services.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CrmModule,
    StorageModule,
    TelephonyModule,
    WhatsAppModule,
    TelegramModule,
    ConversationsModule,
    ServicesModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 60, // 60 requests per minute
    }]),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
