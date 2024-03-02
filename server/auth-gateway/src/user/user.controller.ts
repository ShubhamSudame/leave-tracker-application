import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  NotAcceptableException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  SetMetadata,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { ZodValidationPipe } from '../shared/pipes/zod-validation/zod-validation.pipe';
import {
  CreateUserInput,
  phoneNumberSchema,
  resetPasswordSchema,
  updatePhotoSchema,
  updateUserManagerSchema,
  updateUserRoleSchema,
  createUserSchema,
} from '../shared/schemas/user.schema';
import { User } from './user.entity';
import { existsSync } from 'fs';
import { RolesGuard } from '../shared/guards/roles/roles.guard';
import { UUID } from 'crypto';
import { QueryFailedError } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin', 'manager'])
  async getUsersList(@Req() request: Request, @Res() response: Response) {
    // For admin role, get all users within the same organization
    // For manager role, get all users working under
    const user = await this.userService.findUserById((request.user as User).id);
    if (!user) {
      throw new NotFoundException('No such user found');
    }
    let usersList: User[] = [];
    if (user.role === 'manager') {
      usersList = await this.userService.findSubordinateUsers(user.id);
    } else if (user.role === 'admin') {
      usersList = await this.userService.findUsersInOrganization(user.id);
    }

    return response.status(HttpStatus.OK).json({
      users: usersList,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() request: Request, @Res() response: Response) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }
    const user = await this.userService.findUserById((request.user as User).id);
    return response.status(HttpStatus.OK).json({
      user,
    });
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async createNewUser(
    @Req() request: Request,
    @Body(new ZodValidationPipe<CreateUserInput>(createUserSchema))
    userData: CreateUserInput,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }
    userData.role = 'user';

    const newUserDetails = {
      ...userData,
      organization: (request.user as User).organization,
    };

    try {
      const user = await this.userService.createUser(newUserDetails);

      response.status(HttpStatus.CREATED).json({
        user,
        message: 'New user created successfully',
      });
    } catch (error: any) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(error.driverError.detail);
      }
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async deleteUser(
    @Param('id') userId: UUID,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }

    if ((request.user as User).id === userId) {
      throw new ForbiddenException('Cannot delete self');
    }

    try {
      const userToBeDeleted = await this.userService.findUserById(userId);
      if (!userToBeDeleted) {
        throw new NotFoundException('No such user found to be deleted');
      }

      if (
        userToBeDeleted.organization !== (request.user as User).organization
      ) {
        throw new ForbiddenException(
          'Cannot delete users that do not belong to your organization',
        );
      }

      const deletedUser = await this.userService.deleteUser(userId);
      if (!deletedUser.affected) {
        throw new UnprocessableEntityException(
          'Failed to delete user: ' + userId,
        );
      }

      response.status(HttpStatus.NO_CONTENT).json({
        message: 'Successfully deleted user',
        id: userId,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(error.driverError.detail);
      }
    }
  }

  @Patch(':id/update/manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async updateUserManager(
    @Param('id') userId: UUID,
    @Body(new ZodValidationPipe(updateUserManagerSchema)) managerData: any,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }

    try {
      const user = await this.userService.findUserById(userId);
      const manager = await this.userService.findUserById(
        managerData.managerId,
      );

      if (!user) {
        throw new NotFoundException('No such user found with id: ' + userId);
      }

      if (!manager) {
        throw new NotFoundException(
          'No such manager found with id: ' + managerData.managerId,
        );
      }

      if (user.organization !== (request.user as User).organization) {
        throw new ForbiddenException(
          'You cannot assign a manager to a user of another organization',
        );
      }

      if (manager.organization !== (request.user as User).organization) {
        throw new ForbiddenException(
          'You cannot assign a manager of another organization to user',
        );
      }

      if (user.organization !== manager.organization) {
        throw new ForbiddenException(
          'User and manager must belong to the same organization',
        );
      }

      // If user role was originally 'user', then make role 'manager'
      if (manager && manager.role === 'user') {
        const updatedManager = await this.userService.updateUserRole(
          manager.id,
          'manager',
        );

        if (!updatedManager.affected) {
          throw new UnprocessableEntityException(
            'Failed to make the user a manager',
          );
        }
      }

      const updatedUser = await this.userService.updateUserManager(
        userId,
        managerData.managerId,
      );

      if (!updatedUser.affected) {
        throw new UnprocessableEntityException('Failed to update user manager');
      }

      response.status(HttpStatus.OK).json({
        message: 'Successfully updated user manager',
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(error.driverError.detail);
      }
    }
  }

  @Patch(':id/update/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async updateUserRole(
    @Param('id') userId: UUID,
    @Body(new ZodValidationPipe(updateUserRoleSchema)) roleData: any,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }

    try {
      if ((request.user as User).role !== 'admin') {
        const user = await this.userService.findUserById(userId);

        if (!user) {
          throw new NotFoundException('No such user found with id: ' + userId);
        }

        if (user.organization !== (request.user as User).organization) {
          throw new ForbiddenException(
            'You cannot change the role of a user of another organization',
          );
        }

        const updatedUser = await this.userService.updateUserRole(
          userId,
          roleData.role,
        );

        if (!updatedUser.affected) {
          throw new UnprocessableEntityException('Failed to update user role');
        }
      }

      response.status(HttpStatus.OK).json({
        message: `Successfully updated user's role`,
      });
    } catch (error) {}
  }

  @Put('resetpassword')
  @UseGuards(JwtAuthGuard)
  async resetUserPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) passwordData: any,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }

    const user = await this.userService.findUserById((request.user as User).id);
    if (await User.comparePasswords(passwordData.password, user!.password)) {
      throw new NotAcceptableException(
        'New Password cannot be same as Old Password',
      );
    }
    const updatedUser: User = await this.userService.resetPassword(
      passwordData.password,
      user!.id,
    );

    if (!updatedUser) {
      throw new UnprocessableEntityException('Failed to reset password');
    }

    response.status(HttpStatus.OK).json({
      message: 'Password updated successfully',
    });
  }

  @Patch('update/phonenumber')
  @UseGuards(JwtAuthGuard)
  async updateUserPhoneNumber(
    @Body(new ZodValidationPipe(phoneNumberSchema)) phoneNumberData: any,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }

    const user = await this.userService.findUserById((request.user as User).id);

    const phoneNumberUpdated = await this.userService.updateUserPhoneNumber(
      phoneNumberData.phone_number,
      user!.id,
    );

    if (!phoneNumberUpdated.affected) {
      throw new UnprocessableEntityException(
        "Failed to update user's phone number",
      );
    }

    response.status(HttpStatus.OK).json({
      message: 'Updated Phone Number Successfully',
    });
  }

  @Patch('update/photo')
  @UseGuards(JwtAuthGuard)
  async updateUserPhoto(
    @Body(new ZodValidationPipe(updatePhotoSchema)) photoData: any,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) {
      throw new NotFoundException('No such user found');
    }

    if (!existsSync('./' + photoData.photo)) {
      throw new NotFoundException('No such file found on the server');
    }

    const user = await this.userService.findUserById((request.user as User).id);

    const photoUpdated = await this.userService.updateUserPhoto(
      photoData.photo,
      user!.id,
    );

    if (!photoUpdated.affected) {
      throw new UnprocessableEntityException("Failed to update user's photo");
    }

    response.status(HttpStatus.OK).json({
      message: 'Updated User Photo Successfully',
    });
  }
}
