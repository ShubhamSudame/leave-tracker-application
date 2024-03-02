import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';
import { RolesGuard } from '../shared/guards/roles/roles.guard';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let jwtAuthGuard: JwtAuthGuard;
  let rolesGuard: RolesGuard;

  beforeEach(async () => {
    // This is to mock the JwtAuthGuard, that always allows controller methods to execute
    const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: createMock<UserService>() },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtAuthGuard).toBeDefined();
    expect(rolesGuard).toBeDefined();
  });

  describe('Logged in user details', () => {
    it('should throw NotFoundException if user does not exist', async () => {});

    it('should return details if user exists', async () => {});
  });

  describe('Reset user password', () => {
    it('should throw NotFoundException if user does not exist', async () => {});

    it('should throw NotAcceptableException if new password is same as old password', async () => {});

    it('should throw UnprocessableEntityException if reset password fails', async () => {});

    it('should reset user password', async () => {});
  });

  describe('Update phone number of user', () => {
    it('should throw NotFoundException if user does not exist', async () => {});

    it('should throw UnprocessableEntityException if phone number update fails', async () => {});

    it('should update phone number of user', async () => {});
  });

  describe('Update photo of user', () => {
    it('should throw NotFoundException if user does not exist', async () => {});

    it('should throw UnprocessableEntityException if photo update fails', async () => {});

    it('should update photo of user', async () => {});
  });

  describe('All users', () => {
    it('should get all users of same organization as admin', async () => {});

    it('should get all users under manager', async () => {});
  });

  describe('Create new user', () => {});

  describe('Delete user', () => {});

  describe('Update User Manager', () => {});

  describe('Update User Role', () => {});
});
