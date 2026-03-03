import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { IsNumber } from 'class-validator';

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

export class LeadInputDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class VehicleInputDto {
  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  vin?: string;
}

export class QuickCreateDealDto {
  @ValidateNested()
  @Type(() => LeadInputDto)
  lead!: LeadInputDto;

  @ValidateNested()
  @Type(() => VehicleInputDto)
  @IsOptional()
  vehicle?: VehicleInputDto;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;
}

export class ChecklistItemDto {
  @IsString()
  text!: string;

  @IsBoolean()
  done!: boolean;
}

export class CreateWorkLogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}

export class UpdateChecklistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist!: ChecklistItemDto[];
}
