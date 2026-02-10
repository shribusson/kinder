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
import { VehiclesModule } from "./vehicles/vehicles.module";
import { WorkOrderModule } from "./workorder/workorder.module";
import { MechanicModule } from "./mechanic/mechanic.module";
import { UsersModule } from "./users/users.module";
import { AccountModule } from "./account/account.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./common/roles.guard";

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
    VehiclesModule,
    WorkOrderModule,
    MechanicModule,
    UsersModule,
    AccountModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
