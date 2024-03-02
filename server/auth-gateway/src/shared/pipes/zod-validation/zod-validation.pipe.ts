import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Schema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: Schema) {}

  transform(value: any): T {
    try {
      this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
    }
    return value;
  }
}
