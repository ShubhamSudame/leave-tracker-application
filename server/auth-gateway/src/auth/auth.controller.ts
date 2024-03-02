import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import {
  RegisterUserInput,
  registerUserSchema,
  emailPasswordSchema,
  phoneNumberSchema,
} from '../shared/schemas/user.schema';
import { ZodValidationPipe } from '../shared/pipes/zod-validation/zod-validation.pipe';
import { QueryFailedError } from 'typeorm';
import { OtpService } from '../shared/services/otp/otp.service';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { tokenCookieOptions } from '../utils/common-utils';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private userService: UserService,
    private otpService: OtpService,
  ) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe<RegisterUserInput>(registerUserSchema))
    userData: RegisterUserInput,
    @Res() response: Response,
  ) {
    try {
      const user = await this.userService.createUser(userData);
      const { otp, hash } = await this.otpService.sendOTP(
        userData.phone_number,
      );

      // Introduce a delay of 20s to test the TimeoutInterceptor
      // await new Promise((resolve) => setTimeout(resolve, 20000));

      response.status(HttpStatus.CREATED).json({
        user,
        hash,
        otp,
        message: 'An OTP has been sent to your registered phone number',
      });
    } catch (error: any) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(error.driverError.detail);
      }
    }
  }

  @Post('login/email')
  async loginViaEmailPassword(
    @Body(new ZodValidationPipe(emailPasswordSchema)) loginCredentials,
    @Res() response: Response,
  ) {
    const user = await this.userService.findUserByEmail({
      email: loginCredentials.email,
    });

    if (!user) {
      throw new NotFoundException(
        `No user found with email address ${loginCredentials.email}`,
      );
    }

    if (
      !(await User.comparePasswords(loginCredentials.password, user.password))
    ) {
      throw new ForbiddenException('Password is incorrect.');
    }

    if (!user.verified) {
      throw new ForbiddenException(
        'User is not verified. Please check your email inbox and get verified',
      );
    }

    // response.locals.user = { ...user };

    const accessToken = await this.authService.generateToken(user, 'access');
    const refreshToken = await this.authService.generateToken(user, 'refresh');

    return response
      .status(HttpStatus.OK)
      .cookie(
        'access_token',
        accessToken,
        tokenCookieOptions(
          this.configService.getOrThrow<number>(`jwt.access.expiresIn`),
        ),
      )
      .cookie(
        'refresh_token',
        refreshToken,
        tokenCookieOptions(
          this.configService.getOrThrow<number>(`jwt.refresh.expiresIn`),
        ),
      )
      .json({
        message: 'User logged in successfully',
      });
  }

  @Post('login/phone')
  async loginViaPhoneNumber(
    @Body(new ZodValidationPipe(phoneNumberSchema)) loginCredentials,
    @Res() response: Response,
  ) {
    const user = await this.userService.findUserByPhoneNumber({
      phone_number: loginCredentials.phone_number,
    });

    if (!user) {
      throw new NotFoundException(
        `No user found with phone number ${loginCredentials.phone_number}`,
      );
    }

    const { otp, hash } = await this.otpService.sendOTP(
      loginCredentials.phone_number,
    );

    return response.status(HttpStatus.OK).json({
      phone_number: loginCredentials.phone_number,
      otp,
      hash,
      message: 'An OTP has been sent to your registred mobile number',
    });
  }

  @Post('verifyotp')
  async verifyOTP(@Body() body: any, @Res() response: Response) {
    const phoneNumber = body.phone_number;
    const user = await this.userService.findUserByPhoneNumber({
      phone_number: phoneNumber,
    });

    if (!user) {
      throw new NotFoundException(
        `No user found with phone number ${phoneNumber}`,
      );
    }

    const hashVerified = await this.otpService.verifyHash(
      phoneNumber,
      body.otp,
      body.hash,
    );

    if (!hashVerified) {
      throw new UnauthorizedException(
        'Incorrect OTP. Please enter the correct OTP',
      );
    }

    if (!user.verified) {
      this.userService.verifyUser(user.id);
      return response.status(HttpStatus.OK).json({
        message: 'User is verified. You may login now',
      });
    }

    response.locals.user = { ...user };

    const accessToken = await this.authService.generateToken(user, 'access');
    const refreshToken = await this.authService.generateToken(user, 'refresh');

    return response
      .status(HttpStatus.OK)
      .cookie(
        'access_token',
        accessToken,
        tokenCookieOptions(
          this.configService.getOrThrow<number>(`jwt.access.expiresIn`),
        ),
      )
      .cookie(
        'refresh_token',
        refreshToken,
        tokenCookieOptions(
          this.configService.getOrThrow<number>(`jwt.refresh.expiresIn`),
        ),
      )
      .json({
        message: 'User logged in successfully',
      });
  }

  @Post('resendotp')
  async resendOTP(
    @Body(new ZodValidationPipe(phoneNumberSchema)) body: any,
    @Res() response: Response,
  ) {
    const phoneNumber = body.phone_number;

    const { otp, hash } = await this.otpService.sendOTP(phoneNumber);

    response.status(HttpStatus.OK).json({
      phone_number: phoneNumber,
      otp,
      hash,
      message: 'An OTP has been sent to your registred mobile number',
    });
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() response: Response) {
    return response
      .status(HttpStatus.OK)
      .clearCookie('access_token')
      .clearCookie('refresh_token')
      .json({
        message: 'User logged out',
      });
  }
}
