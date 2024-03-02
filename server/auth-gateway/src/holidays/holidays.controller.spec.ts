import { Test, TestingModule } from '@nestjs/testing';
import { HolidaysController } from './holidays.controller';
import { HttpService } from '@nestjs/axios';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles/roles.guard';
import { CanActivate } from '@nestjs/common';

describe('HolidaysController', () => {
  let holidaysController: HolidaysController;
  let httpService: HttpService;
  let jwtAuthGuard: JwtAuthGuard;
  let rolesGuard: RolesGuard;

  beforeEach(async () => {
    // This is to mock the JwtAuthGuard, that always allows controller methods to execute
    const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidaysController],
      providers: [
        { provide: HttpService, useValue: createMock<HttpService>() },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    holidaysController = module.get<HolidaysController>(HolidaysController);
    httpService = module.get<HttpService>(HttpService);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(holidaysController).toBeDefined();
    expect(httpService).toBeDefined();
    expect(jwtAuthGuard).toBeDefined();
    expect(rolesGuard).toBeDefined();
  });
});
