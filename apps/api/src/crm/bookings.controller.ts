import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateBookingDto, UpdateBookingDto } from "./dto";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("crm/bookings")
export class BookingsController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  @Get()
  list() {
    return this.crm.listBookings();
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() payload: CreateBookingDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createBooking({ ...payload, accountId: membership.accountId });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.crm.getBooking(id);
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async update(@Param("id") id: string, @Body() payload: UpdateBookingDto) {
    return this.crm.updateBooking(id, payload);
  }

  @Delete(":id")
  @Roles("admin", "manager")
  async cancel(@Param("id") id: string) {
    return this.crm.cancelBooking(id);
  }

  @Put(":id/status")
  @Roles("admin", "manager")
  async updateStatus(@Param("id") id: string, @Body() payload: { status: string }) {
    return this.crm.updateBookingStatus(id, payload.status);
  }
}
