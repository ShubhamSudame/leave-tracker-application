import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import twilio from 'twilio';
import crypto from 'crypto';

@Injectable()
export class OtpService {
  // private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    // this.client = twilio(
    //   this.configService.get('TWILIO_ACCOUNT_SID'),
    //   this.configService.get('TWILIO_AUTH_TOKEN'),
    // );
  }

  async sendOTP(loginField: string) {
    const otp = Math.floor(10000 + Math.random() * 90000);
    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;

    const data = `${loginField}.${otp}.${expires}`;
    const hash = crypto
      .createHmac('sha256', this.configService.get<string>('SMS_KEY') || '')
      .update(data)
      .digest('hex');
    const fullHash = `${hash}.${expires}`;

    // await this.client.messages.create({
    //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
    //   to: loginField,
    //   body: `Your OTP is ${otp} and will expire on ${expires}`,
    // });

    return { otp, hash: fullHash };
  }

  async verifyHash(loginField: string, otp: number, hash: string) {
    const [hashValue, expires] = hash.split('.');
    if (parseInt(expires) < Date.now()) {
      throw new RequestTimeoutException(
        'The OTP is expired. Please request for another OTP',
      );
    }

    const data = `${loginField}.${otp}.${expires}`;
    const newCalculatedHash = crypto
      .createHmac('sha256', this.configService.get<string>('SMS_KEY') || '')
      .update(data)
      .digest('hex');

    return newCalculatedHash === hashValue;
  }
}
