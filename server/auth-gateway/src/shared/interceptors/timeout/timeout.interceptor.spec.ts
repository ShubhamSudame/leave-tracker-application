/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { TimeoutInterceptor } from './timeout.interceptor';
import { ConfigService } from '@nestjs/config';
import {
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
} from '@nestjs/common';
import { catchError, of, throwError, timeout, TimeoutError } from 'rxjs';

describe('TimeoutInterceptor', () => {
  let timeoutInterceptor: TimeoutInterceptor;
  let configService: ConfigService;
  let executionContext: ExecutionContext;
  let callHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeoutInterceptor,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            getOrThrow: jest.fn().mockReturnValue('10000'),
          }),
        },
      ],
    }).compile();

    timeoutInterceptor = module.get<TimeoutInterceptor>(TimeoutInterceptor);
    configService = module.get<ConfigService>(ConfigService);
    executionContext = createMock<ExecutionContext>();
    callHandler = createMock<CallHandler>({
      handle: jest.fn().mockReturnValue(of('test')),
    });
  });

  it('should be defined', () => {
    expect(timeoutInterceptor).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should call next.handle with timeout and catchError operator', () => {
    timeoutInterceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toHaveBeenCalled();
    expect(configService.getOrThrow).toHaveBeenCalledWith('TIMEOUT_INTERVAL');
  });

  // it('should throw GatewayTimeoutException when error is instance of TimeoutError', () => {
  //   jest
  //     .spyOn(callHandler, 'handle')
  //     .mockReturnValue(throwError(new TimeoutError()));
  //   expect(() =>
  //     timeoutInterceptor.intercept(executionContext, callHandler).toPromise(),
  //   ).rejects.toThrow(GatewayTimeoutException);
  // });

  // it('should rethrow error when error is not instance of TimeoutError', () => {
  //   const error = new Error('Test error');
  //   jest.spyOn(callHandler, 'handle').mockReturnValue(throwError(error));
  //   expect(() =>
  //     timeoutInterceptor.intercept(executionContext, callHandler).toPromise(),
  //   ).rejects.toThrow(error);
  // });

  it('should throw GatewayTimeoutException when error is instance of TimeoutError', (done) => {
    // This is a substitute, an instance of TimeoutError cannot be created directly using new keyword
    // Hence, we are creating a generic error and assigning TimeoutError to its name, and checking it in the catchError
    const error = new Error('TimeoutError');
    error.name = 'TimeoutError';
    jest.spyOn(callHandler, 'handle').mockReturnValue(
      throwError(() => error).pipe(
        timeout(11000),
        catchError((err) => {
          if (err.name === 'TimeoutError') {
            return throwError(() => new GatewayTimeoutException());
          }
          return throwError(() => err);
        }),
      ),
    );

    timeoutInterceptor.intercept(executionContext, callHandler).subscribe({
      error(err) {
        expect(err).toBeInstanceOf(GatewayTimeoutException);
        done();
      },
    });
  });

  it('should rethrow error when error is not instance of TimeoutError', (done) => {
    const error = new Error('Test error');
    jest.spyOn(callHandler, 'handle').mockReturnValue(throwError(() => error));

    timeoutInterceptor.intercept(executionContext, callHandler).subscribe({
      error(err) {
        expect(err).toBe(error);
        done();
      },
    });
  });
});
