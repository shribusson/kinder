import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../common/roles.decorator';
import { WorkOrderService } from './workorder.service';

@Controller('workorder')
export class WorkOrderController {
  constructor(private workOrderService: WorkOrderService) {}

  @Post('generate/:dealId')
  @Roles('admin', 'manager')
  async generateWorkOrder(@Param('dealId') dealId: string, @Req() req: any) {
    if (!dealId) {
      throw new BadRequestException('Deal ID is required');
    }
    const workOrder = await this.workOrderService.generateWorkOrder(dealId, req.user.accountId);
    return { success: true, data: workOrder };
  }

  @Get(':id')
  @Roles('admin', 'manager', 'mechanic')
  async getWorkOrder(@Param('id') id: string, @Req() req: any) {
    if (!id) {
      throw new BadRequestException('Work order ID is required');
    }
    const workOrder = await this.workOrderService.getWorkOrder(id, req.user.accountId);
    return { success: true, data: workOrder };
  }

  @Get(':dealId/pdf')
  @Roles('admin', 'manager', 'mechanic')
  async downloadPDF(@Param('dealId') dealId: string, @Req() req: any, @Res() res: Response) {
    if (!dealId) {
      throw new BadRequestException('Deal ID is required');
    }
    const pdfBuffer = await this.workOrderService.getPDFBuffer(dealId, req.user.accountId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="work-order-${dealId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }
}
