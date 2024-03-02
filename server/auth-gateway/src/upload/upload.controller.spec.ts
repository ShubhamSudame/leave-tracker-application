import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CanActivate, HttpStatus } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';
import { Readable } from 'typeorm/platform/PlatformTools.js';

describe('UploadController', () => {
  let uploadController: UploadController;

  beforeEach(async () => {
    // Note: In unit testing, we typically test the code that we've written, not the behavior of the libraries used
    // In upload controller, the FileInterceptor internally throws a ContentTooLarge exception if the user provides
    // a file with size exceeding the limit specified in MulterModule in the imports array of UploadModule.
    const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    uploadController = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(uploadController).toBeDefined();
  });

  it('should upload file', async () => {
    const file: Express.Multer.File = {
      filename: 'test.txt',
      path: './resources/test.txt',
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 100,
      destination: './resources',
      buffer: Buffer.from('This is a test file'),
      stream: createMock<Readable>(),
    };

    const result = {
      file: file.filename,
      path: file.path,
    };

    const response = createMock<Response>({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    });

    await uploadController.uploadFile(file, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(response.json).toHaveBeenCalledWith(result);
  });
});
