import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest, LocalAuthRequest } from '../common/types/request.types';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { Public } from '../common/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: LocalAuthRequest, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register({
      ...registerDto,
      role: UserRole.client,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: AuthenticatedRequest, @Body() body: { refreshToken?: string }) {
    await this.authService.logout(req.user.sub, body.refreshToken);
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
