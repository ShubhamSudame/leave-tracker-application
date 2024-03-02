import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { tokenCookieOptions } from '../../utils/common-utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (!request.cookies.refresh_token) {
      throw new NotFoundException('Missing Refresh Token');
    }

    if (!request.cookies.access_token) {
      throw new NotFoundException('Missing Access Token');
    }

    try {
      // Check the refresh token first
      const decodedRefreshToken = await this.authService.verifyToken(
        request.cookies.refresh_token,
      );

      request.user = decodedRefreshToken;

      try {
        await this.authService.verifyToken(request.cookies.access_token);
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          const newAccessToken = await this.authService.generateToken(
            decodedRefreshToken,
            'access',
          );

          response.cookie(
            'access_token',
            newAccessToken,
            tokenCookieOptions(
              this.configService.getOrThrow<number>('jwt.access.expiresIn'),
            ),
          );
        } else if (error instanceof JsonWebTokenError) {
          throw new UnauthorizedException(
            'Invalid Access Token: ' + error.message,
          );
        }
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Refresh Token has expired. Please log in again',
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          'Invalid Refresh Token: ' + error.message,
        );
      }
      return false;
    }
    return true;
  }
}
