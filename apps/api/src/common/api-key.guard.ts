import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const headerKey = request.headers["x-api-key"] as string | undefined;
    if (!headerKey || headerKey !== apiKey) {
      throw new UnauthorizedException("Invalid API key");
    }
    return true;
  }
}
