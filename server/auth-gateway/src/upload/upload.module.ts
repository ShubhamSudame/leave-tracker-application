import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { diskStorage } from 'multer';
import path from 'path';

@Module({
  imports: [
    AuthModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.getOrThrow<string>('FILE_UPLOAD_DIR'),
          filename: (_, file, callback) => {
            callback(
              null,
              path.parse(file.originalname).name.replace(/\s/g, '_') +
                '_' +
                Date.now() +
                path.extname(file.originalname),
            );
          },
        }),
        limits: {
          fileSize:
            Number(configService.getOrThrow<number>('FILE_SIZE_LIMIT')) *
            1024 *
            1024,
        },
      }),
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
