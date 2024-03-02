import { Module } from '@nestjs/common';
import { OtpService } from './services/otp/otp.service';
import { RolesGuard } from './guards/roles/roles.guard';

@Module({
  providers: [OtpService, RolesGuard],
  exports: [OtpService, RolesGuard],
})
export class SharedModule {}
