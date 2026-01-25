import { Module } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { TelephonyController } from './telephony.controller';
import { CallEventsGateway } from './call-events.gateway';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [QueueModule, StorageModule],
  controllers: [TelephonyController],
  providers: [TelephonyService, CallEventsGateway],
  exports: [TelephonyService],
})
export class TelephonyModule {}
