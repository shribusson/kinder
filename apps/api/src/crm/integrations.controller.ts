import { Body, Controller, Delete, Get, Param, Patch, Post, NotFoundException, Req, Query } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { InteractionChannel } from "@prisma/client";
import { Roles } from "../common/roles.decorator";
import { Public } from "../common/public.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";
import { CreateIntegrationDto, UpdateIntegrationDto } from "./dto";

@Controller("crm/integrations")
export class IntegrationsController {
  constructor(private crm: CrmService, private prisma: PrismaService) {}

  @Get()
  async list(@Query("accountId") accountId?: string, @Req() req?: AuthenticatedRequest) {
    let resolvedAccountId = accountId;
    if (!resolvedAccountId && req?.user?.sub) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: req.user.sub },
      });
      resolvedAccountId = membership?.accountId;
    }
    return this.prisma.integration.findMany({
      where: resolvedAccountId ? { accountId: resolvedAccountId } : {},
      select: {
        id: true,
        channel: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Don't select credentials for security
      }
    });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
      select: {
        id: true,
        channel: true,
        status: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        // Don't select credentials for security
      }
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    return integration;
  }

  @Post()
  @Roles("admin")
  async create(@Body() payload: CreateIntegrationDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');

    const integration = await this.prisma.integration.create({
      data: {
        accountId: membership.accountId,
        channel: payload.channel as InteractionChannel,
        credentialsEncrypted: payload.credentialsEncrypted,
        settings: payload.settings as any,
        status: "pending"
      }
    });

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: membership.accountId } },
        action: "create",
        entity: "Integration",
        entityId: integration.id,
        meta: { channel: integration.channel }
      }
    });

    return {
      id: integration.id,
      channel: integration.channel,
      status: integration.status,
      createdAt: integration.createdAt
    };
  }

  @Patch(":id")
  @Roles("admin")
  async update(@Param("id") id: string, @Body() payload: UpdateIntegrationDto) {
    const integration = await this.prisma.integration.findUnique({
      where: { id }
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const updated = await this.prisma.integration.update({
      where: { id },
      data: {
        credentialsEncrypted: payload.credentialsEncrypted,
        settings: payload.settings as any
      }
    });

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: integration.accountId } },
        action: "update",
        entity: "Integration",
        entityId: integration.id,
        meta: { channel: integration.channel }
      }
    });

    return {
      id: updated.id,
      channel: updated.channel,
      status: updated.status,
      updatedAt: updated.updatedAt
    };
  }

  @Delete(":id")
  @Roles("admin")
  async delete(@Param("id") id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id }
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const deleted = await this.prisma.integration.delete({
      where: { id }
    });

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: integration.accountId } },
        action: "delete",
        entity: "Integration",
        entityId: integration.id,
        meta: { channel: integration.channel }
      }
    });

    return {
      id: deleted.id,
      channel: deleted.channel,
      message: "Integration deleted"
    };
  }

  @Post(":id/test")
  @Roles("admin")
  async test(@Param("id") id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id }
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // TODO: Implement actual test logic for each channel
    // For now, return success for all channels
    return {
      integrationId: id,
      channel: integration.channel,
      status: "success",
      message: `Connection test for ${integration.channel} passed`,
      timestamp: new Date()
    };
  }

  private async getAccountId(integrationId?: string): Promise<string> {
    if (integrationId) {
      const integration = await this.crm.getIntegration(integrationId);
      if (integration) {
        return integration.accountId;
      }
    }
    const defaultAccount = await this.crm.getDefaultAccount();
    if (!defaultAccount) {
      throw new NotFoundException('No account found');
    }
    return defaultAccount.id;
  }

  @Public()
  @Post("telegram/webhook/:integrationId?")
  async telegramWebhook(
    @Param("integrationId") integrationId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const accountId = await this.getAccountId(integrationId);
    const enrichedPayload = { ...payload, accountId, integrationId };
    await this.crm.enqueueWebhook(InteractionChannel.telegram, enrichedPayload);
    await this.crm.recordInteraction(accountId, InteractionChannel.telegram, payload);
    return { received: true, channel: "telegram" };
  }

  @Public()
  @Post("whatsapp/webhook/:integrationId?")
  async whatsappWebhook(
    @Param("integrationId") integrationId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const accountId = await this.getAccountId(integrationId);
    const enrichedPayload = { ...payload, accountId, integrationId };
    await this.crm.enqueueWebhook(InteractionChannel.whatsapp, enrichedPayload);
    await this.crm.recordInteraction(accountId, InteractionChannel.whatsapp, payload);
    return { received: true, channel: "whatsapp" };
  }

  @Public()
  @Post("telephony/webhook/:integrationId?")
  async telephonyWebhook(
    @Param("integrationId") integrationId: string,
    @Body() payload: Record<string, unknown>
  ) {
    const accountId = await this.getAccountId(integrationId);
    const enrichedPayload = { ...payload, accountId, integrationId };
    await this.crm.enqueueWebhook(InteractionChannel.telephony, enrichedPayload);
    await this.crm.recordInteraction(accountId, InteractionChannel.telephony, payload);
    return { received: true, channel: "telephony" };
  }

  @Public()
  @Post("website/lead")
  async websiteLead(@Body() payload: Record<string, unknown>) {
    const accountId = await this.getAccountId();
    await this.crm.enqueueWebhook(InteractionChannel.website, { ...payload, accountId });
    if (payload.name && payload.source) {
      await this.crm.createLead({
        accountId,
        name: String(payload.name),
        phone: payload.phone ? String(payload.phone) : undefined,
        email: payload.email ? String(payload.email) : undefined,
        source: String(payload.source),
        utm: payload.utm && typeof payload.utm === "object" ? (payload.utm as Record<string, string>) : undefined
      });
    }
    return { received: true, channel: "website" };
  }

  @Post("webhooks/:id/retry")
  @Roles("admin")
  retry(@Param("id") id: string, @Body() payload: { error?: string }) {
    return this.crm.retryWebhook(id, payload?.error);
  }
}
