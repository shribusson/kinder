import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, CreateServiceHistoryDto } from './dto';
import { Roles } from '../common/roles.decorator';

@Controller('vehicles')
@Roles('admin', 'manager', 'mechanic')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

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

  @Post()
  async createVehicle(@Req() req: any, @Body() dto: CreateVehicleDto) {
    const vehicle = await this.vehiclesService.createVehicle(req.user.accountId, dto);
    return { success: true, data: vehicle };
  }

  @Get(':id')
  async getVehicle(@Param('id') vehicleId: string) {
    return { success: true, data: await this.vehiclesService.getVehicle(vehicleId) };
  }

  @Get(':id/history')
  async getVehicleHistory(@Param('id') vehicleId: string) {
    return { success: true, data: await this.vehiclesService.getVehicleHistory(vehicleId) };
  }

  @Post(':id/history')
  async addServiceHistory(
    @Req() req: any,
    @Param('id') vehicleId: string,
    @Body() dto: CreateServiceHistoryDto,
  ) {
    const entry = await this.vehiclesService.addServiceHistory(req.user.accountId, vehicleId, dto);
    return { success: true, data: entry };
  }

  @Get('lookup/vin/:vin')
  async lookupByVin(@Req() req: any, @Param('vin') vin: string) {
    return { success: true, data: await this.vehiclesService.getVehicleByVin(req.user.accountId, vin) };
  }

  @Get('lookup/plate/:plate')
  async lookupByPlate(@Req() req: any, @Param('plate') plate: string) {
    return { success: true, data: await this.vehiclesService.getVehicleByPlate(req.user.accountId, plate) };
  }
}
