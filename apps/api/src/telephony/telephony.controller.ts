import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '@prisma/client';
import { TelephonyService } from './telephony.service';
import { PrismaService } from '../prisma.service';

class InitiateCallDto {
  accountId!: string;
  from!: string;
  to!: string;
  variables?: Record<string, string>;
}

@Controller('telephony')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TelephonyController {
  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Initiate an outbound call
   */
  @Post('calls')
  @Roles(UserRole.admin, UserRole.manager)
  async initiateCall(@Body() dto: InitiateCallDto, @Req() req: any) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId: dto.accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    if (!dto.from || !dto.to) {
      throw new BadRequestException('from and to numbers are required');
    }

    const result = await this.telephonyService.initiateCall({
      accountId: dto.accountId,
      from: dto.from,
      to: dto.to,
      variables: dto.variables,
    });

    return result;
  }

  /**
   * Get call details
   */
  @Get('calls/:id')
  async getCall(
    @Param('id', ParseIntPipe) id: number,
    @Query('accountId', ParseIntPipe) accountId: string,
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

    const call = await this.telephonyService.getCall(id, accountId);

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    return call;
  }

  /**
   * Get call recordings
   */
  @Get('calls/:id/recordings')
  async getRecordings(
    @Param('id', ParseIntPipe) id: number,
    @Query('accountId', ParseIntPipe) accountId: string,
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

    const recordings = await this.telephonyService.getRecordings(id, accountId);

    return { recordings };
  }

  /**
   * Get call statistics
   */
  @Get('stats')
  async getStats(
    @Query('accountId', ParseIntPipe) accountId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
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

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await this.telephonyService.getCallStats(accountId, start, end);

    return stats;
  }

  /**
   * Health check for ARI connection
   */
  @Get('health')
  async health() {
    return {
      connected: this.telephonyService.isConnected(),
    };
  }
}
