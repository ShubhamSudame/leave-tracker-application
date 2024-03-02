import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { OtpService } from '../shared/services/otp/otp.service';
import { Response } from 'express';
import { User } from '../user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let configService: ConfigService;
  let otpService: OtpService;
  let userService: UserService;

  // beforeAll(() => {
  //   const { unit, unitRef } = TestBed.create(AuthController).compile();

  //   authController = unit;
  //   authService = unitRef.get(AuthService);
  //   configService = unitRef.get(ConfigService);
  //   userService = unitRef.get(UserService);
  //   otpService = unitRef.get(OtpService);
  // });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: OtpService, useValue: createMock<OtpService>() },
        { provide: UserService, useValue: createMock<UserService>() },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    otpService = module.get<OtpService>(OtpService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(configService).toBeDefined();
    expect(otpService).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('should register a user', async () => {
    const mockRequestBody = {
      name: 'Shubham Sudame',
      date_of_birth: '05/12/1997',
      organization: 'Rackware Inc.',
      email: 'shubham.sudame@gmail.com',
      password: 'Rackware@123',
      password_confirm: 'Rackware@123',
      phone_number: '+919765012981',
      role: 'admin',
    };

    const mockUser = {
      id: '827d8501-1e65-42fe-b62c-8fd548f1a526',
      name: 'Shubham Sudame',
      date_of_birth: '05/12/1997',
      organization: 'Rackware Inc.',
      email: 'shubham.sudame@gmail.com',
      password: 'Rackware@123',
      phone_number: '+919765012981',
      role: 'admin',
    };

    const mockOtp = 123456;
    const mockHash = 'mock-hash-value';

    const mockResponseBody = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser as User);
    jest
      .spyOn(otpService, 'sendOTP')
      .mockResolvedValue({ otp: mockOtp, hash: mockHash });

    await authController.register(mockRequestBody, mockResponseBody);

    expect(userService.createUser).toHaveBeenCalledWith(mockRequestBody);
    expect(otpService.sendOTP).toHaveBeenCalledWith(mockUser.phone_number);
    expect(mockResponseBody.status).toHaveBeenCalledWith(201);
    expect(mockResponseBody.json).toHaveBeenCalledWith({
      user: mockUser,
      otp: mockOtp,
      hash: mockHash,
      message: 'An OTP has been sent to your registered phone number',
    });
  });

  describe('login via email/password', () => {
    // This is to mock the User entity class' properties
    jest.mock('../user/user.entity', () => ({
      User: {
        ...jest.requireActual('../user/user.entity'), // keep all other properties
        comparePasswords: jest.fn(), // mock only comparePasswords static method, since it makes use of bcrypt to compare stored hashed password with raw password
      },
    }));

    it('should throw NotFoundException when no user with provided email exists', async () => {
      const mockResponseBody = {
        status: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const mockLoginData = {
        email: 'shubham.sudame@gmail.com',
        password: 'Rackware@123',
      };

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      expect(
        authController.loginViaEmailPassword(mockLoginData, mockResponseBody),
      ).rejects.toThrow(NotFoundException);
      expect(userService.findUserByEmail).toHaveBeenCalledWith({
        email: mockLoginData.email,
      });
    });

    it('should throw ForbiddenException when provided password does not match with user password', async () => {});

    it('should throw ForbiddenException when user has not been verified', async () => {});

    it('should login correctly when everything is fine', async () => {
      // Always provide this in each test case separately. Do not share one common object in a test suite
      const mockResponseBody = {
        status: jest.fn().mockReturnThis(), // Ensure status also returns 'this' for chaining
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const mockLoginData = {
        email: 'shubham.sudame@gmail.com',
        password: 'Rackware@123',
      };

      const mockUserData = {
        id: '827d8501-1e65-42fe-b62c-8fd548f1a526',
        name: 'Shubham Sudame',
        date_of_birth: '05/12/1997',
        email: 'shubham.sudame@gmail.com',
        password: 'Rackware@123',
        phone_number: '+919765012981',
        role: 'admin',
        verified: true,
      };

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockUserData as User);
      jest
        .spyOn(authService, 'generateToken')
        .mockResolvedValueOnce('access_jwt')
        .mockResolvedValueOnce('refresh_jwt');
      jest
        .spyOn(configService, 'getOrThrow')
        .mockReturnValueOnce('60')
        .mockReturnValueOnce('21600');
      jest
        .spyOn(User, 'comparePasswords')
        .mockImplementation(() => Promise.resolve(true));

      await authController.loginViaEmailPassword(
        mockLoginData,
        mockResponseBody,
      );
      expect(userService.findUserByEmail).toHaveBeenCalledWith({
        email: mockLoginData.email,
      });
      expect(authService.generateToken).toHaveBeenCalledTimes(2);
      expect(authService.generateToken).toHaveBeenCalledWith(
        mockUserData,
        'access',
      );
      expect(authService.generateToken).toHaveBeenCalledWith(
        mockUserData,
        'refresh',
      );
      expect(configService.getOrThrow).toHaveBeenCalledTimes(2);
      expect(mockResponseBody.status).toHaveBeenCalledWith(200);
      expect(mockResponseBody.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.anything() }),
      );
      expect(mockResponseBody.cookie).toHaveBeenCalledWith(
        expect.any(String),
        'access_jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        }),
      );
      expect(mockResponseBody.cookie).toHaveBeenCalledWith(
        expect.any(String),
        'refresh_jwt',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        }),
      );
    });
  });

  describe('login via phone number', () => {
    // jest
    //   .spyOn(userService, 'findUserByEmail')
    //   .mockResolvedValue(mockUserData as User);
    it('should throw NotFoundException when no user with provided phone number exists', async () => {});

    it('should login correctly when everything is fine', async () => {});
  });

  describe('verify OTP ', () => {
    it('should throw NotFoundException when no user with provided phone number exists', async () => {});

    it('should throw UnauthorizedException when incorrect OTP is provided', async () => {});

    it('should verify the user when correct OTP is provided', async () => {});
  });

  it('should log out the user', async () => {});
});
