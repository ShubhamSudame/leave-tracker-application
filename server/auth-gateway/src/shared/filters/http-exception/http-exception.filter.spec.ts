import { HttpExceptionFilter } from './http-exception.filter';
import {
  ArgumentsHost,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('HttpExceptionFilter', () => {
  let httpExceptionFilter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    httpExceptionFilter = new HttpExceptionFilter();
    mockArgumentsHost = createMock<ArgumentsHost>({
      switchToHttp: jest
        .fn(() => ({
          getRequest: jest.fn().mockReturnThis(),
          getResponse: jest
            .fn(() => ({
              json: jest.fn().mockReturnThis(),
              status: jest.fn().mockReturnThis(),
            }))
            .mockReturnThis(),
        }))
        .mockReturnThis(),
    });
  });

  it('should be defined', () => {
    expect(httpExceptionFilter).toBeDefined();
  });

  describe('All exception filter tests', () => {
    it('Unauthorized Exception', async () => {
      const unauthorizedException = new UnauthorizedException(
        'Test Unauthorized Exception',
      );

      jest
        .spyOn(unauthorizedException, 'getStatus')
        .mockReturnValue(HttpStatus.UNAUTHORIZED);
      jest.spyOn(unauthorizedException, 'getResponse').mockReturnValue('error');

      httpExceptionFilter.catch(unauthorizedException, mockArgumentsHost);

      expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
      expect(mockArgumentsHost.switchToHttp().getRequest).toHaveBeenCalled();
      expect(mockArgumentsHost.switchToHttp().getResponse).toHaveBeenCalled();
      expect(unauthorizedException.getStatus).toHaveBeenCalled();
      expect(
        mockArgumentsHost.switchToHttp().getResponse().status,
      ).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      // So, while status and json are independent in the sense that they can be called separately, they are dependent in the sense that they
      // both operate on the response object and can be chained together1. This is a common pattern in many JavaScript libraries, not just Express.js
      expect(
        mockArgumentsHost
          .switchToHttp()
          .getResponse()
          .status(HttpStatus.UNAUTHORIZED).json,
      ).toHaveBeenCalledWith({
        status: HttpStatus.UNAUTHORIZED,
        timestamp: expect.any(String),
        path: mockArgumentsHost.switchToHttp().getRequest().url,
        errors: 'error',
      });
    });
  });
});
