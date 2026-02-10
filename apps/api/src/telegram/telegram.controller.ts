import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/public.decorator';
import { InteractionChannel } from '@prisma/client';
import { AuthenticatedRequest, TelegramUpdate } from '../common/types/request.types';

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Webhook receiver
   */
  @Post('webhook/:integrationId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Param('integrationId') integrationId: string,
    @Body() update: TelegramUpdate,
  ) {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== InteractionChannel.telegram) {
      throw new BadRequestException('Invalid integration');
    }

    // Handle business-specific updates before Telegraf (unsupported by @telegraf/types)
    if (update.business_connection) {
      await this.telegramService.handleBusinessConnection(
        integrationId,
        integration.accountId,
        update.business_connection,
      );
      return { ok: true };
    }

    if (update.business_message) {
      await this.telegramService.handleBusinessMessage(
        integrationId,
        integration.accountId,
        update.business_message,
      );
      return { ok: true };
    }

    if (update.edited_business_message) {
      await this.telegramService.handleEditedBusinessMessage(
        integrationId,
        integration.accountId,
        update.edited_business_message,
      );
      return { ok: true };
    }

    if (update.deleted_business_messages) {
      await this.telegramService.handleDeletedBusinessMessages(
        integrationId,
        integration.accountId,
        update.deleted_business_messages,
      );
      return { ok: true };
    }

    // Regular bot updates go through Telegraf
    await this.telegramService.processWebhook(integrationId, update);

    return { ok: true };
  }

  /**
   * Send a Telegram message
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Body() body: {
      integrationId: string;
      chatId: string | number;
      text?: string;
      photo?: string;
      video?: string;
      document?: string;
      audio?: string;
      replyToMessageId?: number;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    // Get integration and verify access
    const integration = await this.prisma.integration.findUnique({
      where: { id: body.integrationId },
    });

    if (!integration) {
      throw new BadRequestException('Integration not found');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.sub,
        accountId: integration.accountId,
      },
    });

    if (!membership) {
      throw new BadRequestException('Access denied');
    }

    const result = await this.telegramService.sendMessage(
      body.integrationId,
      body.chatId,
      {
        text: body.text,
        photo: body.photo,
        video: body.video,
        document: body.document,
        audio: body.audio,
        replyToMessageId: body.replyToMessageId,
      }
    );

    return result;
  }

  /**
   * Notify managers about a new lead
   */
  @Post('notify-managers')
  @UseGuards(JwtAuthGuard)
  async notifyManagers(
    @Body() body: {
      integrationId: string;
      message: string;
      parseMode?: 'Markdown' | 'HTML';
    },
    @Req() req: AuthenticatedRequest,
  ) {
    // Get integration and verify access
    const integration = await this.prisma.integration.findUnique({
      where: { id: body.integrationId },
    });

    if (!integration) {
      throw new BadRequestException('Integration not found');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.sub,
        accountId: integration.accountId,
      },
    });

    if (!membership) {
      throw new BadRequestException('Access denied');
    }

    await this.telegramService.notifyManagers(
      body.integrationId,
      body.message,
      { parseMode: body.parseMode },
    );

    return { success: true };
  }
}
