import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Controller("services")
export class ServicesController {
  constructor(private prisma: PrismaService) {}

  private async getDefaultAccountId(): Promise<string> {
    const account = await this.prisma.account.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!account) throw new Error("No account configured");
    return account.id;
  }

  @Get("categories")
  async listCategories() {
    const accountId = await this.getDefaultAccountId();
    return this.prisma.serviceCategory.findMany({
      where: { accountId },
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  @Get("categories/:slug")
  async getCategory(@Param("slug") slug: string) {
    const accountId = await this.getDefaultAccountId();
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

  @Get()
  async listServices() {
    const accountId = await this.getDefaultAccountId();
    return this.prisma.service.findMany({
      where: { accountId, isActive: true },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
