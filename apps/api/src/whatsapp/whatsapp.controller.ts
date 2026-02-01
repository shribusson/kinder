import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  Req,
  Param,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/public.decorator';
import { InteractionChannel } from '@prisma/client';
import { AuthenticatedRequest, WhatsAppWebhookPayload } from '../common/types/request.types';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Webhook verification (GET)
   * Facebook sends this to verify webhook URL
   */
  @Get('webhook/:integrationId')
  @Public()
  async verifyWebhook(
    @Param('integrationId') integrationId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== InteractionChannel.whatsapp) {
      throw new BadRequestException('Invalid integration');
    }

    const config = integration.settings as Record<string, string>;

    if (mode === 'subscribe' && verifyToken === config.webhookVerifyToken) {
      return challenge;
    }

    throw new UnauthorizedException('Invalid verify token');
  }

  /**
   * Webhook receiver (POST)
   * Receives incoming messages and status updates
   */
  @Post('webhook/:integrationId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Param('integrationId') integrationId: string,
    @Body() payload: WhatsAppWebhookPayload,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== InteractionChannel.whatsapp) {
      throw new BadRequestException('Invalid integration');
    }

    // Verify signature
    const config = integration.settings as Record<string, string>;
    const isValid = this.whatsappService.verifySignature(
      JSON.stringify(payload),
      signature,
      config.appSecret,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Process webhook asynchronously
    await this.whatsappService.processWebhook(integrationId, payload);

    return { success: true };
  }

  /**
   * Send a WhatsApp message
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Body() body: {
      accountId: string;
      to: string;
      type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
      content: string | { url: string; caption?: string } | { templateName: string; language: string; components?: unknown[] };
      conversationId?: string;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.sub,
        accountId: body.accountId,
      },
    });

    if (!membership) {
      throw new BadRequestException('Access denied');
    }

    const result = await this.whatsappService.sendMessage({
      accountId: body.accountId,
      to: body.to,
      type: body.type,
      content: body.content as string | { url: string; caption?: string } | { templateName: string; language: string; components?: any[] },
      conversationId: body.conversationId,
    });

    return result;
  }
}
