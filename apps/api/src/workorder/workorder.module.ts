import { Module } from '@nestjs/common';
import { WorkOrderService } from './workorder.service';
import { WorkOrderController } from './workorder.controller';

@Module({
  providers: [WorkOrderService],
  controllers: [WorkOrderController],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
