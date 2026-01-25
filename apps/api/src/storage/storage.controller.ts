import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '@prisma/client';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma.service';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Upload a file and create MediaFile record
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('accountId', ParseIntPipe) accountId: string,
    @Query('category') category: string,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!category) {
      throw new BadRequestException('Category is required');
    }

    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    // Generate storage key
    const storageKey = this.storageService.generateKey(
      accountId,
      category,
      file.originalname,
    );

    // Upload to S3/MinIO
    const { url } = await this.storageService.upload({
      key: storageKey,
      body: file.buffer,
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedBy: req.user.id.toString(),
      },
    });

    // Create MediaFile record
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        accountId,
        bucket: 'default',
        key: storageKey,
        mimeType: file.mimetype,
        size: file.size,
        url,
      },
    });

    return {
      id: mediaFile.id,
      url: mediaFile.url,
      name: mediaFile.key.split('/').pop(),
      mimeType: mediaFile.mimeType,
      fileSize: mediaFile.size,
      uploadedAt: mediaFile.uploadedAt,
    };
  }

  /**
   * Get signed URL for temporary access
   */
  @Get('signed-url/:id')
  async getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn: number = 3600,
    @Req() req: any,
  ) {
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      throw new NotFoundException('File not found');
    }

    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId: mediaFile.accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('File not found');
    }

    const signedUrl = await this.storageService.getSignedUrl(
      mediaFile.key,
      expiresIn,
    );

    return {
      url: signedUrl,
      expiresIn,
    };
  }

  /**
   * Delete a file
   */
  @Delete(':id')
  @Roles(UserRole.admin, UserRole.manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id') id: string, @Req() req: any) {
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      throw new NotFoundException('File not found');
    }

    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId: mediaFile.accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('File not found');
    }

    // Delete from storage
    await this.storageService.delete(mediaFile.key);

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id },
    });
  }

  /**
   * List files for an account
   */
  @Get('list')
  async listFiles(
    @Req() req: any,
    @Query('accountId', ParseIntPipe) accountId: string,
    @Query('category') category?: string,
  ) {
    // Verify user has access to this account
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        accountId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Account not found');
    }

    const files = await this.prisma.mediaFile.findMany({
      where: {
        accountId,
        key: category ? { startsWith: `accounts/${accountId}/${category}/` } : undefined,
      },
      orderBy: { uploadedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        key: true,
        mimeType: true,
        size: true,
        url: true,
        uploadedAt: true,
      },
    });

    return { files };
  }
}
