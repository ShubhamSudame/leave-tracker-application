import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
// import { TestBed } from '@automock/jest';
import { createMock } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  // beforeAll(() => {
  //   // Create a test environment for AuthService and automatically mock its dependencies.
  //   // unit is the instance of AuthService, and unitRef is a reference to the mocked dependencies.
  //   // unitRef.get() is used to get the mocked instances of the dependencies of AuthService
  //   const { unit, unitRef } = TestBed.create(AuthService).compile();

  //   authService = unit;
  //   jwtService = unitRef.get(JwtService);
  //   configService = unitRef.get(ConfigService);
  // });

  // This is used to set up the testing module, where mock dependencies are injected, and get the instance of the service under test
  // However, the Test.createTestingModule is replaced with TestBed.create from @automock/jest, which automatically creates mocks for dependencies
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should generate a token', async () => {
    const userPayload = {
      id: '827d8501-1e65-42fe-b62c-8fd548f1a526',
      role: 'admin',
      organization: 'Google',
    };
    const tokenType = 'access';

    // mockReturnValue is a method that allows you to specify what value a mocked function should return.
    // This is done when you want to isolate the behavior of the function under test, by controlling the output of its dependencies
    // Here, the sign method of jwtService will return mock value = 'mocked_access_token'
    // the getOrThrow method of configService will return mock value = '60'
    jest.spyOn(jwtService, 'sign').mockReturnValue('mocked_access_token');
    jest.spyOn(configService, 'getOrThrow').mockReturnValue('60');

    // when the generateToken method of authService is called, it internally makes use of jwtService.sign and configService.getOrThrow
    // and hence, their mocked values are returned.
    const result = await authService.generateToken(
      userPayload as User,
      tokenType,
    );

    // Confirm that the sign method of jwtService has been called using the correct parameters
    expect(jwtService.sign).toHaveBeenCalledWith(userPayload, {
      expiresIn: '60s',
    });

    // Confirm that the getOrThrow method of configService has been called using the correct parameters
    expect(configService.getOrThrow).toHaveBeenCalledWith(
      `jwt.${tokenType}.expiresIn`,
    );

    // Confirm that the return value of the generateToken is indeed the mocked value
    expect(result).toBe('mocked_access_token');
  });

  it('should verify a token', async () => {
    const token = 'mocked_token';

    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ userId: 'mocked_userId' });

    const result = await authService.verifyToken(token);

    expect(jwtService.verify).toHaveBeenCalledWith(token);
    expect(result).toEqual({ userId: 'mocked_userId' });
  });

  it('should decode a token', async () => {
    const token = 'mocked_token';

    jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: 'mocked_exp' });

    const result = await authService.decodeToken(token);

    expect(jwtService.decode).toHaveBeenCalledWith(token);
    expect(result).toEqual({ exp: 'mocked_exp' });
  });
});
