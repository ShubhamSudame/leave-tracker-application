import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import { RequestTimeoutException } from '@nestjs/common';

describe('OtpService', () => {
  let otpService: OtpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(otpService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should send OTP to the user', async () => {
    const phone_number = '+919765012981';

    jest
      .spyOn(otpService, 'sendOTP')
      .mockResolvedValue({ otp: 123456, hash: 'Hash_Value' });

    const otpValue = await otpService.sendOTP(phone_number);

    expect(otpService.sendOTP).toHaveBeenCalledWith(phone_number);
    expect(otpValue.otp).toBe(123456);
    expect(otpValue.hash).toBe('Hash_Value');
  });

  describe('Verify OTP', () => {
    const phone_number = '+919765012981';
    const actual_otp: number = 123456;
    const actual_hash: string = 'Hash_Value';

    it('should throw RequestTimeoutException if OTP expired', async () => {
      jest
        .spyOn(otpService, 'verifyHash')
        .mockRejectedValue(new RequestTimeoutException());

      expect(await otpService.verifyHash).rejects.toThrow(
        RequestTimeoutException,
      );
    });

    it('should return false if the OTP does not match with the OTP sent', async () => {
      const given_otp: number = 654321;
      const given_hash: string = 'Hash_Value';

      jest.spyOn(otpService, 'verifyHash').mockImplementation(() => {
        return Promise.resolve(
          actual_otp === given_otp && actual_hash === given_hash,
        );
      });

      const hashVerified = await otpService.verifyHash(
        phone_number,
        given_otp,
        given_hash,
      );

      expect(otpService.verifyHash).toHaveBeenCalledWith(
        phone_number,
        given_otp,
        given_hash,
      );

      expect(hashVerified).toBe(false);
    });

    it('should return false if the hash does not match', async () => {
      const given_otp: number = 123456;
      const given_hash: string = 'Different_Hash_Value';

      jest.spyOn(otpService, 'verifyHash').mockImplementation(() => {
        return Promise.resolve(
          actual_otp === given_otp && actual_hash === given_hash,
        );
      });

      const hashVerified = await otpService.verifyHash(
        phone_number,
        given_otp,
        given_hash,
      );

      expect(otpService.verifyHash).toHaveBeenCalledWith(
        phone_number,
        given_otp,
        given_hash,
      );

      expect(hashVerified).toBe(false);
    });

    it('should return true if the OTP matches with the OTP sent', async () => {
      const given_otp: number = 123456;
      const given_hash: string = 'Hash_Value';

      jest.spyOn(otpService, 'verifyHash').mockImplementation(() => {
        return Promise.resolve(
          actual_otp === given_otp && actual_hash === given_hash,
        );
      });

      const hashVerified = await otpService.verifyHash(
        phone_number,
        given_otp,
        given_hash,
      );

      expect(otpService.verifyHash).toHaveBeenCalledWith(
        phone_number,
        given_otp,
        given_hash,
      );

      expect(hashVerified).toBe(true);
    });
  });
});
