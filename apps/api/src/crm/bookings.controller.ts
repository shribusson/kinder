import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateBookingDto } from "./dto";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";

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
  async create(@Body() payload: CreateBookingDto, @Req() req: any) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.id },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createBooking({ ...payload, accountId: membership.accountId });
  }
}
