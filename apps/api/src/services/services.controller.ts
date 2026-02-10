import { Controller, Get, Post, Patch, Delete, Param, Body, Query, NotFoundException, Req } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Roles } from "../common/roles.decorator";
import { AuthenticatedRequest } from "../common/types/request.types";
import { CreateServiceCategoryDto, UpdateServiceCategoryDto, CreateServiceDto, UpdateServiceDto } from "./dto";

@Controller("services")
export class ServicesController {
  constructor(private prisma: PrismaService) {}

  private async getAccountId(req?: AuthenticatedRequest): Promise<string> {
    if (req?.user?.sub) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: req.user.sub },
      });
      if (membership) return membership.accountId;
    }
    const account = await this.prisma.account.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!account) throw new Error("No account configured");
    return account.id;
  }

  // ============================================
  // CATEGORIES
  // ============================================

  @Get("categories")
  async listCategories(@Req() req?: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    return this.prisma.serviceCategory.findMany({
      where: { accountId },
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  @Get("categories/:slug")
  async getCategory(@Param("slug") slug: string, @Req() req?: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    const category = await this.prisma.serviceCategory.findUnique({
      where: { accountId_slug: { accountId, slug } },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!category) throw new NotFoundException(`Category not found: ${slug}`);
    return category;
  }

  @Post("categories")
  @Roles("admin", "manager")
  async createCategory(@Body() dto: CreateServiceCategoryDto, @Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    return this.prisma.serviceCategory.create({
      data: {
        accountId,
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  @Patch("categories/:id")
  @Roles("admin", "manager")
  async updateCategory(@Param("id") id: string, @Body() dto: UpdateServiceCategoryDto) {
    const category = await this.prisma.serviceCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return this.prisma.serviceCategory.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
      },
    });
  }

  @Delete("categories/:id")
  @Roles("admin")
  async deleteCategory(@Param("id") id: string) {
    const category = await this.prisma.serviceCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return this.prisma.serviceCategory.delete({ where: { id } });
  }

  // ============================================
  // SERVICES
  // ============================================

  @Get()
  async listServices(@Query("categoryId") categoryId?: string, @Req() req?: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    return this.prisma.service.findMany({
      where: {
        accountId,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  @Get(":id")
  async getService(@Param("id") id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!service) throw new NotFoundException("Service not found");
    return service;
  }

  @Post()
  @Roles("admin", "manager")
  async createService(@Body() dto: CreateServiceDto, @Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    return this.prisma.service.create({
      data: {
        accountId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        priceNote: dto.priceNote,
        unit: dto.unit,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: { category: true },
    });
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async updateService(@Param("id") id: string, @Body() dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");
    return this.prisma.service.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        priceNote: dto.priceNote,
        unit: dto.unit,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
      include: { category: true },
    });
  }

  @Delete(":id")
  @Roles("admin")
  async deleteService(@Param("id") id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");
    return this.prisma.service.delete({ where: { id } });
  }
}
