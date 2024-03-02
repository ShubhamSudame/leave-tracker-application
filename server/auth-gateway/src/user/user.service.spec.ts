import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { UUID } from 'crypto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  const USER_REPOSITORY_TOKEN = getRepositoryToken(User);
  const savedUser = {
    name: 'Shubham Sudame',
    date_of_birth: '05/12/1997',
    email: 'shubham.sudame@gmail.com',
    phone_number: '+919765012981',
    role: 'admin',
    id: '036387f3-64c5-4c31-aea8-4f0e37b08176',
  };
  // For services which have TypeORM Repositories injected as dependency,
  // the service is being isolated from the rest of the application and is being tested in a controlled environment
  // For UserService, Repository<User> is the injected dependency. You're creating a mock version of it and providing it to the UserService through the Testing module
  // This mocked userRepository is independent of the actual userRepository that's provided by TypeOrmModule via DatabaseModule in production environment
  // In the beforeEach, a testing module is created, using UserService and a mock userRepository, which is separate from the actual application setup.
  // The UserService in the testing module doesn't know anything about the DatabaseModule or the UserModule or any other part of your application.
  // It only knows about the dependencies you've provided in the test setup.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          // Nest keeps track of all its dependencies using a token
          provide: USER_REPOSITORY_TOKEN,
          useValue: createMock<Repository<User>>(),
          // useValue: {
          //   // mock out the methods of the userRepository that are used in methods of user service class
          //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
          //   create: jest.fn((x) => new User()),
          //   findOneBy: jest.fn(),
          //   update: jest.fn(),
          //   save: jest.fn(),
          // },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(USER_REPOSITORY_TOKEN); // get user repository instance by providing the token
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should create user', async () => {
    const userInputData = {
      name: 'Shubham Sudame',
      date_of_birth: '05/12/1997',
      email: 'shubham.sudame@gmail.com',
      password: 'Rackware@123',
      password_confirm: 'Rackware@123',
      phone_number: '+919765012981',
      role: 'admin',
    };

    const createdUser = await userService.createUser(userInputData);
    expect(userRepository.create).toHaveBeenCalledWith(userInputData);
    expect(userRepository.save).toHaveBeenCalled();
    expect(createdUser?.password).not.toBe(userInputData.password);
  });

  it('should find user based on email provided', async () => {
    const email = 'shubham.sudame@gmail.com';

    jest
      .spyOn(userService, 'findUserByEmail')
      .mockResolvedValue(savedUser as User);

    const user = await userService.findUserByEmail({ email: email });

    expect(userService.findUserByEmail).toHaveBeenCalledWith({ email: email });
    expect(user!.id).toBe(savedUser.id);
  });

  it('should find user based on Id provided', async () => {
    const userId = '036387f3-64c5-4c31-aea8-4f0e37b08176';

    jest
      .spyOn(userService, 'findUserById')
      .mockResolvedValue(savedUser as User);

    const user = await userService.findUserById(userId);

    expect(userService.findUserById).toHaveBeenCalledWith(userId);
    expect(user!.id).toBe(savedUser.id);
  });

  it('should find user based on phone number provided', async () => {
    const phone_number = '+919765012981';

    jest
      .spyOn(userService, 'findUserByPhoneNumber')
      .mockResolvedValue(savedUser as User);

    const user = await userService.findUserByPhoneNumber({ phone_number });

    expect(userService.findUserByPhoneNumber).toHaveBeenCalledWith({
      phone_number,
    });
    expect(user!.id).toBe(savedUser.id);
  });

  it('should verify the user', async () => {
    const userId = '036387f3-64c5-4c31-aea8-4f0e37b08176';

    await userService.verifyUser(userId);

    expect(userRepository.update).toHaveBeenCalledWith(
      { id: userId },
      { verified: true },
    );
  });

  it("should reset user's password", async () => {
    jest
      .spyOn(userService, 'findUserById')
      .mockResolvedValue(savedUser as User);

    const user = await userService.resetPassword(
      'NewPassword@123',
      savedUser.id as UUID,
    );

    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  it("should update the user's phone number", async () => {
    const userId = '036387f3-64c5-4c31-aea8-4f0e37b08176';
    const new_phone_number = '+919881152210';

    await userService.updateUserPhoneNumber(new_phone_number, userId);

    expect(userRepository.update).toHaveBeenCalledWith(
      { id: userId },
      { phone_number: new_phone_number },
    );
  });

  it("should update the user's photo", async () => {
    const userId = '036387f3-64c5-4c31-aea8-4f0e37b08176';
    const new_photo = 'path-to-photo';

    await userService.updateUserPhoto(new_photo, userId);

    expect(userRepository.update).toHaveBeenCalledWith(
      { id: userId },
      { photo: new_photo },
    );
  });
});
