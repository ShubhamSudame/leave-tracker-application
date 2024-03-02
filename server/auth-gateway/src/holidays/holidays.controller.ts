import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Holidays')
@Controller('holidays')
export class HolidaysController {
  constructor(private httpService: HttpService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getHolidays(@Query() query: any) {
    // In production environment, replace localhost:8000 with "holidays-service", the name of the clusterIP service that interacts with holidays deployment
    return this.httpService
      .get('http://localhost:8000/holidays', {
        params: query,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          if (error.response) {
            throw new HttpException(error.response.data, error.response.status);
          } else {
            throw new HttpException(
              error.message,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }),
      );
  }

  @Put('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async addHoliday(@Body() body: any) {
    return this.httpService.put('http://localhost:8000/holidays', body).pipe(
      map((response) => response.data),
      catchError((error) => {
        if (error.response) {
          throw new HttpException(error.response.data, error.response.status);
        } else {
          throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );
  }

  @Delete(':date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async deleteHoliday(@Param('date') date: string) {
    return this.httpService
      .delete(`http://localhost:8000/holidays/${date}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          if (error.response) {
            throw new HttpException(error.response.data, error.response.status);
          } else {
            throw new HttpException(
              error.message,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }),
      );
  }
}
