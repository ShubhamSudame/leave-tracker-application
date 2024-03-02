import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { createMock } from '@golevelup/ts-jest';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    rolesGuard = moduleRef.get<RolesGuard>(RolesGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if role is in metadata', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
      const context = createMock<ExecutionContext>({
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'admin' } }),
        })),
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should return false if role is not in metadata', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
      const context = createMock<ExecutionContext>({
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'user' } }),
        })),
      });

      try {
        rolesGuard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual("You don't have access to this endpoint");
      }
    });
  });
});
