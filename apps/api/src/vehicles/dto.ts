import { IsString, IsInt, IsOptional, IsBoolean, Min, Max, MaxLength, IsNotEmpty } from 'class-validator';

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

// ============================================
// BRAND DTOs
// ============================================

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cyrillicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsInt()
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  yearTo?: number;
}

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cyrillicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsInt()
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  yearTo?: number;
}

// ============================================
// MODEL DTOs
// ============================================

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  id!: string;

  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cyrillicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  class?: string;

  @IsOptional()
  @IsInt()
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  yearTo?: number;
}

export class UpdateModelDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cyrillicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  class?: string;

  @IsOptional()
  @IsInt()
  yearFrom?: number;

  @IsOptional()
  @IsInt()
  yearTo?: number;
}
