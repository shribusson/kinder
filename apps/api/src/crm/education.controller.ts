import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";
import {
  CreateCourseDto,
  CreateProgramDto,
  EnrollFromDealDto,
} from "./dto";

@Controller("crm/education")
export class EducationController {
  constructor(private prisma: PrismaService) {}

  private async getAccountId(req: AuthenticatedRequest): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error("No account");
    return membership.accountId;
  }

  @Get("overview")
  async getOverview(@Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);

    const [programs, courses, cohorts, enrollments] = await Promise.all([
      this.prisma.program.count({ where: { accountId } }),
      this.prisma.course.count({ where: { accountId } }),
      this.prisma.cohort.count({ where: { accountId } }),
      this.prisma.enrollment.count({ where: { accountId } }),
    ]);

    return { programs, courses, cohorts, enrollments };
  }

  @Get("programs")
  async listPrograms(@Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);

    return this.prisma.program.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      include: {
        courses: {
          orderBy: { createdAt: "desc" },
          include: {
            cohorts: {
              orderBy: { startsAt: "asc" },
            },
          },
        },
      },
    });
  }

  @Post("programs")
  @Roles("admin", "manager")
  async createProgram(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateProgramDto,
  ) {
    const accountId = await this.getAccountId(req);

    return this.prisma.program.create({
      data: {
        accountId,
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        isActive: payload.isActive ?? true,
      },
    });
  }

  @Post("courses")
  @Roles("admin", "manager")
  async createCourse(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateCourseDto,
  ) {
    const accountId = await this.getAccountId(req);

    const program = await this.prisma.program.findFirst({
      where: { id: payload.programId, accountId },
      select: { id: true },
    });
    if (!program) {
      throw new NotFoundException("Program not found");
    }

    return this.prisma.course.create({
      data: {
        accountId,
        programId: payload.programId,
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        level: payload.level,
        ageMin: payload.ageMin,
        ageMax: payload.ageMax,
        durationWeeks: payload.durationWeeks,
        price: payload.price,
        currency: payload.currency ?? "KZT",
        isActive: payload.isActive ?? true,
      },
    });
  }

  @Get("enrollments")
  async listEnrollments(
    @Req() req: AuthenticatedRequest,
    @Query("dealId") dealId?: string,
    @Query("courseId") courseId?: string,
  ) {
    const accountId = await this.getAccountId(req);

    return this.prisma.enrollment.findMany({
      where: {
        accountId,
        ...(dealId ? { dealId } : {}),
        ...(courseId ? { courseId } : {}),
      },
      include: {
        family: true,
        student: true,
        course: { include: { program: true } },
        cohort: true,
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  @Post("enrollments/from-deal")
  @Roles("admin", "manager")
  async enrollFromDeal(
    @Req() req: AuthenticatedRequest,
    @Body() payload: EnrollFromDealDto,
  ) {
    const accountId = await this.getAccountId(req);

    const deal = await this.prisma.deal.findFirst({
      where: { id: payload.dealId, accountId },
      include: { lead: true },
    });
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    const course = await this.prisma.course.findFirst({
      where: { id: payload.courseId, accountId },
      select: { id: true },
    });
    if (!course) {
      throw new NotFoundException("Course not found");
    }

    if (payload.cohortId) {
      const cohort = await this.prisma.cohort.findFirst({
        where: { id: payload.cohortId, accountId, courseId: payload.courseId },
        select: { id: true },
      });
      if (!cohort) {
        throw new NotFoundException("Cohort not found");
      }
    }

    const family = await this.prisma.family.create({
      data: {
        accountId,
        name: payload.parentName,
        phone: payload.parentPhone ?? deal.lead.phone,
        email: payload.parentEmail ?? deal.lead.email,
        notes: `Created from deal ${deal.id}`,
      },
    });

    const student = await this.prisma.student.create({
      data: {
        accountId,
        familyId: family.id,
        firstName: payload.studentFirstName,
        lastName: payload.studentLastName,
      },
    });

    const inferredParentUser = payload.parentUserId
      ? await this.prisma.user.findFirst({
          where: {
            id: payload.parentUserId,
            accountId,
          },
          select: { id: true },
        })
      : await this.prisma.user.findFirst({
          where: {
            accountId,
            OR: [
              ...(family.email ? [{ email: family.email }] : []),
              ...(family.phone ? [{ phone: family.phone }] : []),
            ],
          },
          select: { id: true },
        });

    if (inferredParentUser?.id) {
      await this.prisma.familyGuardian.upsert({
        where: {
          familyId_userId: {
            familyId: family.id,
            userId: inferredParentUser.id,
          },
        },
        update: {
          relationLabel: "parent",
          isPrimary: true,
        },
        create: {
          familyId: family.id,
          userId: inferredParentUser.id,
          relationLabel: "parent",
          isPrimary: true,
        },
      });
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        accountId,
        familyId: family.id,
        studentId: student.id,
        courseId: payload.courseId,
        cohortId: payload.cohortId,
        leadId: deal.leadId,
        dealId: deal.id,
        status: "active",
        startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
        notes: payload.notes,
      },
      include: {
        family: true,
        student: true,
        course: { include: { program: true } },
        cohort: true,
      },
    });

    return enrollment;
  }
}
