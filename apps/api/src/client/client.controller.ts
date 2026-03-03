import { Controller, Get, Query, Req } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Public } from "../common/public.decorator";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("client")
export class ClientController {
  constructor(private prisma: PrismaService) {}

  private async resolveAccountId(req?: AuthenticatedRequest, explicitAccountId?: string): Promise<string> {
    if (explicitAccountId) return explicitAccountId;

    if (req?.user?.sub) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: req.user.sub },
      });
      if (membership) return membership.accountId;
    }

    const firstAccount = await this.prisma.account.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!firstAccount) throw new Error("No account configured");
    return firstAccount.id;
  }

  @Get("catalog/programs")
  @Public()
  async listPrograms(@Query("accountId") accountId?: string) {
    const resolvedAccountId = await this.resolveAccountId(undefined, accountId);
    return this.prisma.program.findMany({
      where: { accountId: resolvedAccountId, isActive: true },
      orderBy: { createdAt: "asc" },
      include: {
        courses: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  @Get("catalog/courses")
  @Public()
  async listCourses(
    @Query("accountId") accountId?: string,
    @Query("programId") programId?: string,
  ) {
    const resolvedAccountId = await this.resolveAccountId(undefined, accountId);
    return this.prisma.course.findMany({
      where: {
        accountId: resolvedAccountId,
        isActive: true,
        ...(programId ? { programId } : {}),
      },
      include: {
        program: true,
        cohorts: {
          where: { status: "active" },
          orderBy: { startsAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  @Get("me/enrollments")
  async getMyEnrollments(@Req() req: AuthenticatedRequest) {
    const accountId = await this.resolveAccountId(req);
    const guardianLinks = await this.prisma.familyGuardian.findMany({
      where: { userId: req.user.sub, family: { accountId } },
      include: {
        family: {
          include: {
            students: {
              include: {
                enrollments: {
                  include: {
                    course: { include: { program: true } },
                    cohort: true,
                  },
                  orderBy: { enrolledAt: "desc" },
                },
              },
            },
          },
        },
      },
    });

    return guardianLinks.map((guardianLink) => ({
      familyId: guardianLink.family.id,
      familyName: guardianLink.family.name,
      relationLabel: guardianLink.relationLabel,
      isPrimary: guardianLink.isPrimary,
      students: guardianLink.family.students,
    }));
  }
}
