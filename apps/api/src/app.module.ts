import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { HealthController } from "./health.controller";
import { CrmModule } from "./crm/crm.module";
import { PrismaModule } from "./prisma.module";
import { AuthModule } from "./auth/auth.module";
import { StorageModule } from "./storage/storage.module";
// TODO: Re-enable after schema migration
// import { TelephonyModule } from "./telephony/telephony.module";
// import { WhatsAppModule } from "./whatsapp/whatsapp.module";
// import { TelegramModule } from "./telegram/telegram.module";
import { ConversationsModule } from "./conversations/conversations.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CrmModule,
    StorageModule,
    // TelephonyModule,  // Disabled - needs schema migration
    // WhatsAppModule,   // Disabled - needs schema migration  
    // TelegramModule,   // Disabled - needs schema migration
    ConversationsModule,
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
