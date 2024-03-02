import { Test, TestingModule } from '@nestjs/testing';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CanActivate, HttpStatus } from '@nestjs/common';
import { UploadController } from '../../../src/upload/upload.controller';
import configuration from '../../../src/config/configuration';
import { JwtAuthGuard } from '../../../src/auth/jwt-auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import fs from 'fs';
import path from 'path';
import supertest from 'supertest';

describe('Upload Controller Integration Test', () => {
  let app;

  beforeAll(async () => {
    const mockJwtAuthGuard: CanActivate = {
      canActivate: () => Promise.resolve(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        MulterModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            storage: diskStorage({
              destination: configService.getOrThrow<string>(
                'TEST_FILE_UPLOADS_DIR',
              ),
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
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(() => {
    // Delete the uploaded files in the ./resources/test after each test
    const deleteAllFilesInDir = async (dirPath) => {
      try {
        const files = fs.readdirSync(dirPath);

        const deleteFilePromises = files.map((file) =>
          fs.unlinkSync(path.join(dirPath, file)),
        );

        await Promise.all(deleteFilePromises);
      } catch (err) {
        console.log(err);
      }
    };
    deleteAllFilesInDir('./resources/test');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should store file in ./resources/test folder', async () => {
    return await supertest(app.getHttpServer())
      .post('/api/upload')
      .attach('file', './test/files/photo.jpg')
      .set('Content-Type', 'multipart/form-data')
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body.file).toBeDefined();
        expect(fs.existsSync(`./resources/test/${response.body.file}`)).toBe(
          true,
        );
      });
  });

  it('should throw an exception if file size exceeds limit', async () => {
    return await supertest(app.getHttpServer())
      .post('/api/upload')
      .attach('file', './test/files/too_big_photo.jpg')
      .set('Content-Type', 'multipart/form-data')
      .expect(HttpStatus.PAYLOAD_TOO_LARGE);
  });
});
