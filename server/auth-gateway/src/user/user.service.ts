import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(userInput: DeepPartial<User>): Promise<User | null> {
    return await this.userRepository.save(
      this.userRepository.create(userInput),
    );
  }

  async findUserByEmail({ email }: { email: string }): Promise<User | null> {
    return (await this.userRepository.findOneBy({ email })) as User;
  }

  async findUserById(userId: UUID): Promise<User | null> {
    return (await this.userRepository.findOne({
      where: { id: userId },
      // relations: ['subordinates'],
    })) as User;
  }

  async findUserByPhoneNumber({
    phone_number,
  }: {
    phone_number: string;
  }): Promise<User | null> {
    return (await this.userRepository.findOneBy({ phone_number })) as User;
  }

  async verifyUser(userId: UUID) {
    return await this.userRepository.update({ id: userId }, { verified: true });
  }

  async recognizeUser(userId: UUID) {
    return await this.userRepository.update(
      { id: userId },
      { initialLogin: false },
    );
  }

  async findSubordinateUsers(managerId: UUID) {
    return await this.userRepository.find({ where: { managerId } });
  }

  async findUsersInOrganization(adminUserId: UUID) {
    const adminUser = await this.findUserById(adminUserId);
    return adminUser
      ? await this.userRepository.find({
          where: { organization: adminUser.organization },
        })
      : [];
  }

  async resetPassword(password: string, userId: UUID) {
    const user = await this.findUserById(userId);
    user!.password = password;
    return await this.userRepository.save(user!);
  }

  async updateUserPhoneNumber(phone_number: string, userId: UUID) {
    return await this.userRepository.update({ id: userId }, { phone_number });
  }

  async updateUserPhoto(photo: string, userId: UUID) {
    return await this.userRepository.update({ id: userId }, { photo });
  }

  async deleteUser(userId: UUID) {
    return await this.userRepository.delete({ id: userId });
  }

  async updateUserRole(userId: UUID, role: string) {
    return await this.userRepository.update({ id: userId }, { role });
  }

  async updateUserManager(userId: UUID, managerId: UUID) {
    return await this.userRepository.update({ id: userId }, { managerId });
  }
}
