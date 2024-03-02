// This is a redundant file
import { BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';

export const validateSchema = (schema: Schema) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      schema.parse({
        params: request.params,
        query: request.query,
        body: request.body,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
    }
  };
};
