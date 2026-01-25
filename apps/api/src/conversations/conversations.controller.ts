import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma.service';
import { InteractionChannel } from '@prisma/client';

@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get conversations list
   */
  @Get()
  async getConversations(
    @Req() req: any,
    @Query('accountId') accountId: string,
    @Query('channel') channel?: InteractionChannel,
    @Query('search') search?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('assignedToUserId') assignedToUserId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    return this.conversationsService.getConversations({
      accountId,
      channel,
      search,
      unreadOnly: unreadOnly === 'true',
      assignedToUserId,
      page,
      limit,
    });
  }

  /**
   * Get single conversation
   */
  @Get(':id')
  async getConversation(
    @Param('id') id: string,
    @Query('accountId') accountId: string,
    @Req() req: any,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    const conversation = await this.conversationsService.getConversation(
      id,
      accountId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  /**
   * Mark conversation as read
   */
  @Post(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Body('accountId') accountId: string,
    @Req() req: any,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    await this.conversationsService.markAsRead(id, accountId);

    return { success: true };
  }

  /**
   * Assign conversation to user
   */
  @Patch(':id/assign')
  async assignConversation(
    @Param('id') id: string,
    @Body('accountId') accountId: string,
    @Body('userId') userId: string,
    @Req() req: any,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    return this.conversationsService.assignConversation(id, accountId, userId);
  }

  /**
   * Archive conversation
   */
  @Post(':id/archive')
  async archiveConversation(
    @Param('id') id: string,
    @Body('accountId') accountId: string,
    @Req() req: any,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    return this.conversationsService.archiveConversation(id, accountId);
  }

  /**
   * Get conversation stats
   */
  @Get('stats')
  async getStats(@Query('accountId') accountId: string, @Req() req: any) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    return this.conversationsService.getStats(accountId);
  }
}
