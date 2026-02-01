import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TelephonyService } from './telephony.service';
import { TelephonyController } from './telephony.controller';
import { CallEventsGateway } from './call-events.gateway';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    QueueModule,
    StorageModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [TelephonyController],
  providers: [TelephonyService, CallEventsGateway],
  exports: [TelephonyService],
})
export class TelephonyModule {}
