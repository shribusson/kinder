import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsObject,
  IsArray,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';
import { DealStage, LeadStage } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Source is required' })
  @MaxLength(100)
  source!: string;

  @IsOptional()
  @IsEnum(LeadStage, { message: 'Invalid lead stage' })
  stage?: LeadStage;

  @IsOptional()
  @IsObject()
  utm?: Record<string, string | undefined>;

  @IsOptional()
  @IsObject()
  vehicleData?: {
    brandId: string;
    modelId: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
  };
}

export class CreateDealDto {
  @IsUUID('4', { message: 'Invalid lead ID format' })
  @IsNotEmpty({ message: 'Lead ID is required' })
  leadId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsEnum(DealStage, { message: 'Invalid deal stage' })
  stage?: DealStage;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be positive' })
  amount!: number;

  @IsOptional()
  @IsNumber({}, { message: 'Revenue must be a number' })
  @Min(0, { message: 'Revenue must be positive' })
  revenue?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Estimated hours must be a number' })
  @Min(0, { message: 'Estimated hours must be positive' })
  estimatedHours?: number;

  @IsOptional()
  @IsObject()
  vehicleData?: {
    brandId: string;
    modelId: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
  };

  @IsOptional()
  @IsArray()
  services?: Array<{ serviceId: string; quantity: number }>;

  @IsOptional()
  @IsArray()
  serviceTimeBudgets?: Array<{ serviceId: string; plannedMinutes: number }>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  failReason?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid guarantee date format' })
  guaranteeUntil?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid booking date format' })
  bookingScheduledAt?: string;
}

export class CreateBookingDto {
  @IsUUID('4', { message: 'Invalid lead ID format' })
  @IsNotEmpty({ message: 'Lead ID is required' })
  leadId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Specialist is required' })
  @MaxLength(200)
  specialist!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsDateString({}, { message: 'Invalid date format' })
  @IsNotEmpty({ message: 'Scheduled date is required' })
  scheduledAt!: string;

  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  @MaxLength(50)
  status!: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Source is required' })
  @MaxLength(100)
  source!: string;

  @IsNumber({}, { message: 'Spend must be a number' })
  @Min(0, { message: 'Spend must be positive' })
  spend!: number;

  @IsNumber({}, { message: 'Leads count must be a number' })
  @Min(0, { message: 'Leads count must be positive' })
  leads!: number;
}

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(120)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  isActive?: boolean;
}

export class CreateCourseDto {
  @IsUUID('4', { message: 'Invalid program ID format' })
  @IsNotEmpty({ message: 'Program ID is required' })
  programId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(120)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  level?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ageMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationWeeks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  isActive?: boolean;
}

export class EnrollFromDealDto {
  @IsUUID('4', { message: 'Invalid deal ID format' })
  @IsNotEmpty({ message: 'Deal ID is required' })
  dealId!: string;

  @IsUUID('4', { message: 'Invalid course ID format' })
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid cohort ID format' })
  cohortId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Parent name is required' })
  @MaxLength(200)
  parentName!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number format' })
  parentPhone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  parentEmail?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid parent user ID format' })
  parentUserId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Student first name is required' })
  @MaxLength(200)
  studentFirstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Student last name is required' })
  @MaxLength(200)
  studentLastName!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid start date format' })
  startsAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

// ============================================
// UPDATE DTOs
// ============================================

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsEnum(LeadStage, { message: 'Invalid lead stage' })
  stage?: LeadStage;

  @IsOptional()
  @IsObject()
  utm?: Record<string, string | undefined>;

  @IsOptional()
  @IsObject()
  vehicleData?: {
    brandId: string;
    modelId: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
  };
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(DealStage, { message: 'Invalid deal stage' })
  stage?: DealStage;

  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be positive' })
  amount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Revenue must be a number' })
  @Min(0, { message: 'Revenue must be positive' })
  revenue?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Estimated hours must be a number' })
  @Min(0, { message: 'Estimated hours must be positive' })
  estimatedHours?: number;

  @IsOptional()
  @IsObject()
  vehicleData?: {
    brandId: string;
    modelId: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
  };

  @IsOptional()
  @IsArray()
  services?: Array<{ serviceId: string; quantity: number }>;

  @IsOptional()
  @IsArray()
  serviceTimeBudgets?: Array<{ serviceId: string; plannedMinutes: number }>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  failReason?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid guarantee date format' })
  guaranteeUntil?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid booking date format' })
  bookingScheduledAt?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialist?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Spend must be a number' })
  @Min(0, { message: 'Spend must be positive' })
  spend?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Leads count must be a number' })
  @Min(0, { message: 'Leads count must be positive' })
  leads?: number;
}

export class CreateSalesPlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Period is required' })
  period!: string;

  @IsNumber({}, { message: 'Target must be a number' })
  @Min(0, { message: 'Target must be positive' })
  target!: number;
}

export class UpdateSalesPlanDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Target must be a number' })
  @Min(0, { message: 'Target must be positive' })
  target?: number;
}

export class CreateIntegrationDto {
  @IsEnum(['telegram', 'whatsapp', 'telephony'], { message: 'Invalid channel' })
  @IsNotEmpty({ message: 'Channel is required' })
  channel!: string;

  @IsOptional()
  @IsString()
  credentialsEncrypted?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class UpdateIntegrationDto {
  @IsOptional()
  @IsString()
  credentialsEncrypted?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
