import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { generateWorkOrderHTML, WorkOrderData } from './templates/work-order.template';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class WorkOrderService {
  constructor(private prisma: PrismaService) {}

  async getNextOrderNumber(accountId: string): Promise<number> {
    const lastOrder = await this.prisma.workOrder.findFirst({
      where: { accountId },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    return (lastOrder?.orderNumber || 0) + 1;
  }

  async generateWorkOrder(dealId: string, accountId: string) {
    const existingWorkOrder = await this.prisma.workOrder.findUnique({
      where: { dealId },
    });
    if (existingWorkOrder) {
      throw new BadRequestException('Work order already exists for this deal');
    }

    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        lead: true,
        assignedResource: true,
        dealItems: { include: { service: true } },
        vehicle: { include: { brand: true, model: true } },
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.accountId !== accountId) throw new BadRequestException('Unauthorized access to deal');

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { workOrderSettings: true },
    });
    const workOrderSettings = (account?.workOrderSettings as any) || {};

    const orderNumber = await this.getNextOrderNumber(accountId);

    const services = deal.dealItems.map((item) => ({
      name: item.service.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
    }));

    const totalAmount = services.reduce((sum, s) => sum + s.total, 0) || deal.amount;

    const carModel = deal.vehicle
      ? `${deal.vehicle.brand?.cyrillicName || deal.vehicle.brand?.name || ''} ${deal.vehicle.model?.cyrillicName || deal.vehicle.model?.name || ''}`.trim()
      : (deal.metadata as any)?.carModel || 'Не указан';

    const workOrderData: WorkOrderData = {
      orderNumber,
      date: new Date().toISOString(),
      customerName: deal.lead.name,
      customerPhone: deal.lead.phone ?? undefined,
      carModel,
      licensePlate: deal.vehicle?.licensePlate || (deal.metadata as any)?.licensePlate,
      vin: deal.vehicle?.vin || (deal.metadata as any)?.vin,
      mechanicName: deal.assignedResource?.name,
      companyName: workOrderSettings.companyName,
      companyInn: workOrderSettings.inn,
      companyOkpo: workOrderSettings.okpo,
      companyAddress: workOrderSettings.address,
      companyPhone: workOrderSettings.phone,
      services: services.length > 0 ? services : [{
        name: deal.title,
        quantity: 1,
        unitPrice: deal.amount,
        total: deal.amount,
      }],
      totalAmount,
    };

    const html = generateWorkOrderHTML(workOrderData);
    const fileName = `work-order-${dealId}-${orderNumber}.html`;
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, html);

    const workOrder = await this.prisma.workOrder.create({
      data: {
        accountId,
        dealId,
        orderNumber,
        customerName: deal.lead.name,
        carModel,
        licensePlate: deal.vehicle?.licensePlate || (deal.metadata as any)?.licensePlate,
        vin: deal.vehicle?.vin || (deal.metadata as any)?.vin,
        pdfUrl: `/workorder/${dealId}/pdf`,
        metadata: {
          htmlPath: filePath,
          generatedAt: new Date().toISOString(),
          vehicleId: deal.vehicle?.id,
        },
      },
    });

    return {
      id: workOrder.id,
      dealId: workOrder.dealId,
      orderNumber: workOrder.orderNumber,
      customerName: workOrder.customerName,
      pdfUrl: workOrder.pdfUrl,
      generatedAt: workOrder.generatedAt,
    };
  }

  async getWorkOrder(workOrderId: string, accountId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: { deal: true },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');
    if (workOrder.accountId !== accountId) throw new BadRequestException('Unauthorized access');
    return workOrder;
  }

  async getPDFBuffer(dealId: string, accountId: string): Promise<Buffer> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { dealId },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');
    if (workOrder.accountId !== accountId) throw new BadRequestException('Unauthorized access');

    const metadata = workOrder.metadata as any;
    const htmlPath = metadata?.htmlPath;
    if (!htmlPath || !fs.existsSync(htmlPath)) {
      throw new NotFoundException('Work order file not found');
    }
    return fs.readFileSync(htmlPath);
  }
}
