import { Test, TestingModule } from '@nestjs/testing';
// import { TestBed } from '@automock/jest';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: AuthService;
  let configService: ConfigService;

  // beforeAll(() => {
  //   const { unit, unitRef } = TestBed.create(JwtAuthGuard).compile();
  //   guard = unit;
  //   authService = unitRef.get(AuthService);
  //   configService = unitRef.get(ConfigService);
  // });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('JwtAuthGuard should be defined', () => {
    expect(guard).toBeDefined();
    expect(authService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('Refresh Token', () => {
    it('should throw NotFoundException if not in request cookies', async () => {});

    it('should throw TokenExpiredError if it expired', async () => {});

    it('should throw JsonWebTokenError if it is an invalid token', async () => {});

    it('should verify the token and get user information', async () => {});
  });

  describe('Access Token', () => {
    it('should throw NotFoundException if not in request cookies', async () => {});

    it('should throw JsonWebTokenError if it is an invalid token', async () => {});

    it('should replace expired token with a new access token created from decoded refresh token', async () => {});

    it('should verify the token and return true', async () => {});
  });
});
