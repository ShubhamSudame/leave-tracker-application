import { Test, TestingModule } from '@nestjs/testing';
import { TestDatabaseModule } from '../database/database.module';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../../../src/user/user.service';

describe('User Service Integration Test', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  const USER_REPOSITORY_TOKEN = getRepositoryToken(User);
  let module: TestingModule;
  let savedUser: User | null;

  const userDetails = {
    name: 'Charlie Brown',
    email: 'charlie.brown@gmail.com',
    password: 'SnoopDog50$',
    phone_number: '+919881152210',
    date_of_birth: '18/03/2000',
  };

  beforeAll(async () => {
    // For integration testing, we import the TestDatabaseModule, which will be used by the TypeORM to
    // create a test data source and inject a repository for the entity in the service.
    // Hence, when the methods of the service are called, they act on the test database, and hence aren't mocked.
    module = await Test.createTestingModule({
      imports: [TestDatabaseModule, TypeOrmModule.forFeature([User])],
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(USER_REPOSITORY_TOKEN);
  });

  afterAll(async () => {
    // Once all integration test cases are done, close the datasource of test database
    await module.close();
  });

  it('should be defined', async () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should create a user', async () => {
    savedUser = await userService.createUser(userDetails);
    expect(savedUser).toBeDefined();
    expect(savedUser!.name).toBe(userDetails.name);
    expect(savedUser!.phone_number).toBe(userDetails.phone_number);
    expect(savedUser!.role).toBe('user');
  });

  it('should hash the password', async () => {
    const hashedPasswordMatch = await User.comparePasswords(
      userDetails.password,
      savedUser!.password,
    );
    expect(hashedPasswordMatch).toBe(true);
  });

  it('should return user from ID', async () => {
    const storedUser = await userService.findUserById(savedUser!.id);
    expect(storedUser!.id).toBe(savedUser!.id);
  });

  it('should return user from email', async () => {
    const storedUser = await userService.findUserByEmail({
      email: savedUser!.email,
    });
    expect(storedUser!.email).toBe(userDetails.email);
  });

  it('should return user from phone number', async () => {
    const storedUser = await userService.findUserByPhoneNumber({
      phone_number: savedUser!.phone_number,
    });
    expect(storedUser!.phone_number).toBe(userDetails.phone_number);
  });

  it('should reset user password', async () => {
    const newPassword = 'B@ngla71$WB';
    const updatedUser = await userService.resetPassword(
      newPassword,
      savedUser!.id,
    );
    const hashedUpdatedPassword = await User.comparePasswords(
      newPassword,
      updatedUser.password,
    );
    expect(hashedUpdatedPassword).toBe(true);
  });
});
