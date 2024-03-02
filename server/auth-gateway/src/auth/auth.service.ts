import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateToken(user: User, tokenType: string) {
    const payload = {
      id: user.id,
      role: user.role,
      organization: user.organization,
    };

    return this.jwtService.sign(payload, {
      expiresIn:
        this.configService.getOrThrow<string>(`jwt.${tokenType}.expiresIn`) +
        's',
    });
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  async decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
