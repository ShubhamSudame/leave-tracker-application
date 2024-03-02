import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';
import { Schema, ZodError } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  let zodValidationPipe: ZodValidationPipe<any>;
  let schema: Schema;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZodValidationPipe,
        { provide: Schema, useValue: createMock<Schema>() },
      ],
    }).compile();

    zodValidationPipe = module.get<ZodValidationPipe<any>>(ZodValidationPipe);
    schema = module.get<Schema<any>>(Schema);
  });

  it('should be defined', () => {
    expect(zodValidationPipe).toBeDefined();
    expect(schema).toBeDefined();
  });

  it('should call schema.parse with the correct value', () => {
    const value = 'test';
    zodValidationPipe.transform(value);
    expect(schema.parse).toHaveBeenCalledWith(value);
  });

  it('should return the value when schema.parse does not throw an error', () => {
    const value = 'test';
    const result = zodValidationPipe.transform(value);
    expect(result).toBe(value);
  });

  it('should throw a BadRequestException when schema.parse throws a ZodError', () => {
    const value = 'test';
    const error = new ZodError([]);

    jest.spyOn(schema, 'parse').mockImplementation(() => {
      throw error;
    });
    expect(() => zodValidationPipe.transform(value)).toThrow(
      BadRequestException,
    );
  });
});
