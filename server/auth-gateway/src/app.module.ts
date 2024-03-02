import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SharedModule } from './shared/shared.module';
import { HttpExceptionFilter } from './shared/filters/http-exception/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';
import { TimeoutInterceptor } from './shared/interceptors/timeout/timeout.interceptor';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { UploadModule } from './upload/upload.module';
import { DatabaseModule } from './database/database.module';
import { HolidaysModule } from './holidays/holidays.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    SharedModule,
    AuthModule,
    UserModule,
    UploadModule,
    DevtoolsModule.register({
      http: false,
    }),
    DatabaseModule,
    HolidaysModule,
    // DevtoolsModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     http: configService.getOrThrow<string>('ENV') !== 'Production',
    //   }),
    // }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
