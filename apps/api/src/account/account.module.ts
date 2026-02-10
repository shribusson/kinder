import { Module } from '@nestjs/common';
import { AccountSettingsController } from './account-settings.controller';

@Module({
  controllers: [AccountSettingsController],
})
export class AccountModule {}
