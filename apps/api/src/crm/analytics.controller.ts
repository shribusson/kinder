import { Controller, Get } from "@nestjs/common";
import { CrmService } from "./crm.service";

@Controller("crm/analytics")
export class AnalyticsController {
  constructor(private crm: CrmService) {}

  @Get("summary")
  summary() {
    return this.crm.analyticsSummary();
  }

  @Get("utm")
  utm() {
    return this.crm.utmReport();
  }
}
