import { Module } from "@nestjs/common";
import { LeadsController } from "./leads.controller";
import { DealsController } from "./deals.controller";
import { BookingsController } from "./bookings.controller";
import { CampaignsController } from "./campaigns.controller";
import { AnalyticsController } from "./analytics.controller";
import { IntegrationsController } from "./integrations.controller";
import { SalesPlansController } from "./sales-plans.controller";
import { ResourcesController } from "./resources.controller";
import { CrmService } from "./crm.service";
import { ApiKeyGuard } from "../common/api-key.guard";
import { RolesGuard } from "../common/roles.guard";
import { APP_GUARD } from "@nestjs/core";
import { QueueModule } from "../queue/queue.module";
import { QueuesController } from "../queue/queues.controller";

@Module({
  imports: [QueueModule],
  controllers: [
    LeadsController,
    DealsController,
    BookingsController,
    CampaignsController,
    AnalyticsController,
    IntegrationsController,
    SalesPlansController,
    ResourcesController,
    QueuesController,
  ],
  providers: [
    CrmService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class CrmModule {}
