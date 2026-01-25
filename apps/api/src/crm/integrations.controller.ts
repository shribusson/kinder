import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { InteractionChannel } from "@prisma/client";
import { Roles } from "../common/roles.decorator";

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

  @Post("telegram/webhook")
  async telegramWebhook(@Body() payload: Record<string, unknown>) {
    await this.crm.enqueueWebhook(InteractionChannel.telegram, payload);
    await this.crm.recordInteraction('1', InteractionChannel.telegram, payload);
    return { received: true, channel: "telegram" };
  }

  @Post("whatsapp/webhook")
  async whatsappWebhook(@Body() payload: Record<string, unknown>) {
    await this.crm.enqueueWebhook(InteractionChannel.whatsapp, payload);
    await this.crm.recordInteraction('1', InteractionChannel.whatsapp, payload);
    return { received: true, channel: "whatsapp" };
  }

  @Post("telephony/webhook")
  async telephonyWebhook(@Body() payload: Record<string, unknown>) {
    await this.crm.enqueueWebhook(InteractionChannel.telephony, payload);
    await this.crm.recordInteraction('1', InteractionChannel.telephony, payload);
    return { received: true, channel: "telephony" };
  }

  @Post("website/lead")
  async websiteLead(@Body() payload: Record<string, unknown>) {
    await this.crm.enqueueWebhook(InteractionChannel.website, payload);
    if (payload.name && payload.source) {
      await this.crm.createLead({
        accountId: '1', // TODO: Get from integration
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
