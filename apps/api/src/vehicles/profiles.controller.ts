import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, CreateServiceHistoryDto, CreateBrandDto, UpdateBrandDto, CreateModelDto, UpdateModelDto } from './dto';
import { Roles } from '../common/roles.decorator';
import { PrismaService } from '../prisma.service';

@Controller('profiles')
@Roles('admin', 'manager', 'mechanic')
export class ProfilesController {
  constructor(
    private vehiclesService: VehiclesService,
    private prisma: PrismaService,
  ) {}

  @Get('brands')
  async getBrands(@Query('popular') popular?: string) {
    const popularFilter = popular === 'true' ? true : undefined;
    return { success: true, data: await this.vehiclesService.getBrands(popularFilter) };
  }

  @Get('brands/search')
  async searchBrands(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return { success: true, data: [] };
    }
    return { success: true, data: await this.vehiclesService.searchBrands(query) };
  }

  @Post('brands')
  @Roles('admin')
  async createBrand(@Body() dto: CreateBrandDto) {
    const brand = await this.prisma.vehicleBrand.create({
      data: {
        id: dto.id,
        name: dto.name,
        cyrillicName: dto.cyrillicName,
        country: dto.country,
        popular: dto.popular ?? false,
        yearFrom: dto.yearFrom,
        yearTo: dto.yearTo,
      },
    });
    return { success: true, data: brand };
  }

  @Patch('brands/:id')
  @Roles('admin')
  async updateBrand(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const brand = await this.prisma.vehicleBrand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    const updated = await this.prisma.vehicleBrand.update({
      where: { id },
      data: {
        name: dto.name,
        cyrillicName: dto.cyrillicName,
        country: dto.country,
        popular: dto.popular,
        yearFrom: dto.yearFrom,
        yearTo: dto.yearTo,
      },
    });
    return { success: true, data: updated };
  }

  @Delete('brands/:id')
  @Roles('admin')
  async deleteBrand(@Param('id') id: string) {
    const brand = await this.prisma.vehicleBrand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    await this.prisma.vehicleBrand.delete({ where: { id } });
    return { success: true };
  }

  @Get('brands/:id/models')
  async getModels(@Param('id') brandId: string) {
    return { success: true, data: await this.vehiclesService.getModels(brandId) };
  }

  @Get('models/search')
  async searchModels(@Query('brandId') brandId: string, @Query('q') query: string) {
    if (!brandId || !query || query.length < 2) {
      return { success: true, data: [] };
    }
    return { success: true, data: await this.vehiclesService.searchModels(brandId, query) };
  }

  @Post('models')
  @Roles('admin')
  async createModel(@Body() dto: CreateModelDto) {
    const brand = await this.prisma.vehicleBrand.findUnique({ where: { id: dto.brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
    const model = await this.prisma.vehicleModel.create({
      data: {
        id: dto.id,
        brandId: dto.brandId,
        name: dto.name,
        cyrillicName: dto.cyrillicName,
        class: dto.class,
        yearFrom: dto.yearFrom,
        yearTo: dto.yearTo,
      },
      include: { brand: { select: { id: true, name: true } } },
    });
    return { success: true, data: model };
  }

  @Patch('models/:id')
  @Roles('admin')
  async updateModel(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    const model = await this.prisma.vehicleModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('Model not found');
    const updated = await this.prisma.vehicleModel.update({
      where: { id },
      data: {
        name: dto.name,
        cyrillicName: dto.cyrillicName,
        class: dto.class,
        yearFrom: dto.yearFrom,
        yearTo: dto.yearTo,
      },
      include: { brand: { select: { id: true, name: true } } },
    });
    return { success: true, data: updated };
  }

  @Delete('models/:id')
  @Roles('admin')
  async deleteModel(@Param('id') id: string) {
    const model = await this.prisma.vehicleModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException('Model not found');
    await this.prisma.vehicleModel.delete({ where: { id } });
    return { success: true };
  }

  @Get('list')
  async listProfiles(@Req() req: any) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new NotFoundException('No account');
    const profiles = await this.prisma.vehicle.findMany({
      where: { accountId: membership.accountId },
      include: {
        brand: { select: { id: true, name: true, cyrillicName: true } },
        model: { select: { id: true, name: true, cyrillicName: true, class: true } },
        _count: { select: { serviceHistory: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: profiles };
  }

  @Post()
  async createProfile(@Req() req: any, @Body() dto: CreateVehicleDto) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new NotFoundException('No account');
    const profile = await this.vehiclesService.createVehicle(membership.accountId, dto);
    return { success: true, data: profile };
  }

  @Get(':id')
  async getProfile(@Param('id') profileId: string) {
    return { success: true, data: await this.vehiclesService.getVehicle(profileId) };
  }

  @Get(':id/history')
  async getProfileHistory(@Param('id') profileId: string) {
    return { success: true, data: await this.vehiclesService.getVehicleHistory(profileId) };
  }

  @Delete(':id')
  async deleteProfile(@Req() req: any, @Param('id') profileId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new NotFoundException('No account');
    const deleted = await this.vehiclesService.deleteVehicle(membership.accountId, profileId);
    return { success: true, data: deleted };
  }

  @Post(':id/history')
  async addProfileHistory(
    @Req() req: any,
    @Param('id') profileId: string,
    @Body() dto: CreateServiceHistoryDto,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new NotFoundException('No account');
    const entry = await this.vehiclesService.addServiceHistory(membership.accountId, profileId, dto);
    return { success: true, data: entry };
  }

  @Get('lookup/vin/:vin')
  async lookupByVin(@Req() req: any, @Param('vin') vin: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new NotFoundException('No account');
    return { success: true, data: await this.vehiclesService.getVehicleByVin(membership.accountId, vin) };
  }

  @Get('lookup/plate/:plate')
  async lookupByPlate(@Req() req: any, @Param('plate') plate: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new NotFoundException('No account');
    return { success: true, data: await this.vehiclesService.getVehicleByPlate(membership.accountId, plate) };
  }
}
