import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

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
    @Param('integrationId', ParseIntPipe) integrationId: string,
    @Body() update: any,
  ) {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== 'TELEGRAM') {
      throw new BadRequestException('Invalid integration');
    }

    // Process webhook asynchronously
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
      accountId: string;
      chatId: string | number;
      text?: string;
      photo?: string;
      video?: string;
      document?: string;
      audio?: string;
      conversationId?: number;
      replyToMessageId?: number;
    },
    @Req() req: any,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId: body.accountId,
      },
    });

    if (!membership) {
      throw new BadRequestException('Access denied');
    }

    const result = await this.telegramService.sendMessage({
      accountId: body.accountId,
      chatId: body.chatId,
      text: body.text,
      photo: body.photo,
      video: body.video,
      document: body.document,
      audio: body.audio,
      conversationId: body.conversationId,
      replyToMessageId: body.replyToMessageId,
    });

    return result;
  }

  /**
   * Notify managers about a new lead
   */
  @Post('notify-managers')
  @UseGuards(JwtAuthGuard)
  async notifyManagers(
    @Body() body: {
      accountId: string;
      message: string;
      parseMode?: 'Markdown' | 'HTML';
    },
    @Req() req: any,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId: body.accountId,
      },
    });

    if (!membership) {
      throw new BadRequestException('Access denied');
    }

    await this.telegramService.notifyManagers(
      body.accountId,
      body.message,
      { parseMode: body.parseMode },
    );

    return { success: true };
  }
}
