import { Body, Controller, Get, Param, Post, NotFoundException } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { InteractionChannel } from "@prisma/client";
import { Roles } from "../common/roles.decorator";
import { Public } from "../common/public.decorator";

@Controller("crm/integrations")
export class IntegrationsController {
  constructor(private crm: CrmService) {}

  @Get()
  status() {
    return {
      telegram: "active",
      whatsapp: "active",
      telephony: "active",
      website: "active"
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
