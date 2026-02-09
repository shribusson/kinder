import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class StartTimerDto {
  @IsUUID('4', { message: 'Invalid deal ID format' })
  @IsNotEmpty({ message: 'Deal ID is required' })
  dealId!: string;

  @IsUUID('4', { message: 'Invalid resource ID format' })
  @IsNotEmpty({ message: 'Resource ID is required' })
  resourceId!: string;
}

export class StopTimerDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
