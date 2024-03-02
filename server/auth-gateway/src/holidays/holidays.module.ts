import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HolidaysController } from './holidays.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [HolidaysController],
})
export class HolidaysModule {}
