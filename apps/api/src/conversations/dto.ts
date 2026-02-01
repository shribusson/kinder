import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumberString,
  IsBooleanString,
  MaxLength,
} from 'class-validator';
import { InteractionChannel } from '@prisma/client';

export class SendMessageDto {
  @IsUUID('4', { message: 'Invalid account ID format' })
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Message text is required' })
  @MaxLength(4096, { message: 'Message too long' })
  text!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid media file ID format' })
  mediaFileId?: string;
}

export class MarkAsReadDto {
  @IsUUID('4', { message: 'Invalid account ID format' })
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId!: string;
}

export class AssignConversationDto {
  @IsUUID('4', { message: 'Invalid account ID format' })
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId!: string;

  @IsUUID('4', { message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;
}

export class GetConversationsQueryDto {
  @IsUUID('4', { message: 'Invalid account ID format' })
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId!: string;

  @IsOptional()
  @IsEnum(InteractionChannel, { message: 'Invalid channel' })
  channel?: InteractionChannel;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsBooleanString({ message: 'unreadOnly must be a boolean string' })
  unreadOnly?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid assigned user ID format' })
  assignedToUserId?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a number' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a number' })
  limit?: string;
}

export class ArchiveConversationDto {
  @IsUUID('4', { message: 'Invalid account ID format' })
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId!: string;
}
