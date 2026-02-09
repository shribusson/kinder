import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVehicleDto, CreateServiceHistoryDto } from './dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async getBrands(popular?: boolean) {
    return this.prisma.vehicleBrand.findMany({
      where: popular !== undefined ? { popular } : undefined,
      orderBy: [
        { popular: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        cyrillicName: true,
        country: true,
        popular: true,
        yearFrom: true,
        yearTo: true,
      },
    });
  }

  async searchBrands(query: string) {
    return this.prisma.vehicleBrand.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { cyrillicName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { popular: 'desc' },
        { name: 'asc' },
      ],
      take: 20,
      select: {
        id: true,
        name: true,
        cyrillicName: true,
        country: true,
        popular: true,
      },
    });
  }

  async getModels(brandId: string) {
    return this.prisma.vehicleModel.findMany({
      where: { brandId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        cyrillicName: true,
        class: true,
        yearFrom: true,
        yearTo: true,
      },
    });
  }

  async searchModels(brandId: string, query: string) {
    return this.prisma.vehicleModel.findMany({
      where: {
        brandId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { cyrillicName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,
      select: {
        id: true,
        name: true,
        cyrillicName: true,
        class: true,
        yearFrom: true,
        yearTo: true,
      },
    });
  }

  async createVehicle(accountId: string, data: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        accountId,
        ...data,
      },
      include: {
        brand: {
          select: { id: true, name: true, cyrillicName: true },
        },
        model: {
          select: { id: true, name: true, cyrillicName: true, class: true },
        },
      },
    });
  }

  async getVehicleByVin(accountId: string, vin: string) {
    return this.prisma.vehicle.findUnique({
      where: { accountId_vin: { accountId, vin } },
      include: {
        brand: { select: { id: true, name: true, cyrillicName: true } },
        model: { select: { id: true, name: true, cyrillicName: true, class: true } },
      },
    });
  }

  async getVehicleByPlate(accountId: string, licensePlate: string) {
    return this.prisma.vehicle.findUnique({
      where: { accountId_licensePlate: { accountId, licensePlate } },
      include: {
        brand: { select: { id: true, name: true, cyrillicName: true } },
        model: { select: { id: true, name: true, cyrillicName: true, class: true } },
      },
    });
  }

  async getVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        brand: {
          select: { id: true, name: true, cyrillicName: true, country: true },
        },
        model: {
          select: { id: true, name: true, cyrillicName: true, class: true, yearFrom: true, yearTo: true },
        },
      },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async getVehicleHistory(vehicleId: string) {
    return this.prisma.vehicleServiceHistory.findMany({
      where: { vehicleId },
      orderBy: { serviceDate: 'desc' },
      include: {
        deal: {
          select: { id: true, title: true, stage: true },
        },
      },
    });
  }

  async addServiceHistory(accountId: string, vehicleId: string, data: CreateServiceHistoryDto) {
    return this.prisma.vehicleServiceHistory.create({
      data: {
        accountId,
        vehicleId,
        serviceDate: new Date(),
        ...data,
      },
    });
  }

  async findOrCreateVehicle(accountId: string, data: CreateVehicleDto) {
    if (data.vin) {
      const existing = await this.getVehicleByVin(accountId, data.vin);
      if (existing) return existing;
    }
    if (data.licensePlate) {
      const existing = await this.getVehicleByPlate(accountId, data.licensePlate);
      if (existing) return existing;
    }
    return this.createVehicle(accountId, data);
  }
}
