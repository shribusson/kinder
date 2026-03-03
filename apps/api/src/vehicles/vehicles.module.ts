import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { ProfilesController } from './profiles.controller';

@Module({
  providers: [VehiclesService],
  controllers: [VehiclesController, ProfilesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
