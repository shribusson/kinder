import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  brandId!: string;

  @IsString()
  modelId!: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateServiceHistoryDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileageAtService?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  dealId?: string;
}
