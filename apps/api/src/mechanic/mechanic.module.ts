import { Module } from '@nestjs/common';
import { MechanicController } from './mechanic.controller';
import { OperationsController } from './operations.controller';
import { MechanicService } from './mechanic.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [MechanicController, OperationsController],
  providers: [MechanicService],
  exports: [MechanicService],
})
export class MechanicModule {}
