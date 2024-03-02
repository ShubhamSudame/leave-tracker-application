import {
  registerUserSchema,
  emailPasswordSchema,
  phoneNumberSchema,
  resetPasswordSchema,
  updatePhotoSchema,
} from './user.schema';

describe('validate create user schema', () => {
  const userData = {
    name: 'Shubham Sudame',
    date_of_birth: '05/12/1997',
    organization: 'Rackware Inc.',
    email: 'shubham.sudame@gmail.com',
    password: 'Rackware@123',
    password_confirm: 'Rackware@123',
    phone_number: '+919765012981',
  };

  describe('Required fields in schema', () => {
    const requiredFields: any = {
      name: 'Name is required',
      date_of_birth: 'Date of birth is required',
      organization: 'Organization is required',
      email: 'Email address is required',
      password: 'Password is required',
      password_confirm: 'Confirm Password is required',
      phone_number: 'Phone Number is required',
    };

    Object.keys(requiredFields).forEach((field) => {
      it(`should fail if ${field} is not provided`, () => {
        const userDataWithoutField: any = { ...userData };
        delete userDataWithoutField[field];

        const result: any = registerUserSchema.safeParse(userDataWithoutField);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(
          result.error.issues.some(
            (issue: any) => issue.message === requiredFields[field],
          ),
        ).toBeTruthy();
      });
    });

    it('should succeed when all required fields are provided', () => {
      const result: any = registerUserSchema.safeParse(userData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('name field', () => {
    it('should fail if name contains non-alphabetic characters', () => {
      const userDataWithInvalidName = { ...userData, name: 'Shubham  97&#;' };
      const result: any = registerUserSchema.safeParse(userDataWithInvalidName);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Name must contain only alphabets',
        ),
      ).toBeTruthy();
    });

    it('should fail if name is less than 2 characters', () => {
      const userDataWithInvalidName = { ...userData, name: 'S' };
      const result: any = registerUserSchema.safeParse(userDataWithInvalidName);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'Name must have at least 2 characters',
        ),
      ).toBeTruthy();
    });

    it('should fail if name exceeds 32 characters', () => {
      const userDataWithInvalidName = {
        ...userData,
        name: 'ShubhamSandeepSudhakarShankarSudame',
      };
      const result: any = registerUserSchema.safeParse(userDataWithInvalidName);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Name cannot exceed 32 characters',
        ),
      ).toBeTruthy();
    });

    it('should fail if invalid data type is provided', () => {
      const userDataWithInvalidDataType = { ...userData, name: 12345 };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidDataType,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Name must contain only alphabets',
        ),
      ).toBeTruthy();
      expect(
        result.error.issues.some((issue: any) => issue.code === 'invalid_type'),
      ).toBeTruthy();
    });
  });

  describe('date_of_birth field', () => {
    it('should fail if user is less than 18 years old', () => {
      const userDataWithInvalidDate = {
        ...userData,
        date_of_birth: '25/04/2014',
      };
      const result: any = registerUserSchema.safeParse(userDataWithInvalidDate);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'You must be at least 18 years old to sign up',
        ),
      ).toBeTruthy();
    });

    it('should fail if user provides future date as date of birth', () => {
      const userDataWithInvalidDate = {
        ...userData,
        date_of_birth: '25/04/2024',
      };
      const result: any = registerUserSchema.safeParse(userDataWithInvalidDate);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'Date of birth cannot be in the future',
        ),
      ).toBeTruthy();
    });

    it('should fail if user does not enter date in DD/MM/YYYY format', () => {
      const userDataWithInvalidDate = {
        ...userData,
        date_of_birth: '04/25/2014',
      };
      const result: any = registerUserSchema.safeParse(userDataWithInvalidDate);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Date must be in DD/MM/YYYY format',
        ),
      ).toBeTruthy();
    });

    it('should fail if invalid data type is provided', () => {
      const userDataWithInvalidDataType = {
        ...userData,
        date_of_birth: 12051997,
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidDataType,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Date must be in DD/MM/YYYY format',
        ),
      ).toBeTruthy();
      expect(
        result.error.issues.some((issue: any) => issue.code === 'invalid_type'),
      ).toBeTruthy();
    });
  });

  describe('email field', () => {
    it('should fail if invalid email address is provided', () => {
      const userDataWithInvalidEmail = {
        ...userData,
        email: 'sh.comub!@9*@gmail',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidEmail,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid email address',
        ),
      ).toBeTruthy();
    });

    it('should fail if invalid data type is provided', () => {
      const userDataWithInvalidDataType = { ...userData, email: 12345 };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidDataType,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid email address',
        ),
      ).toBeTruthy();
      expect(
        result.error.issues.some((issue: any) => issue.code === 'invalid_type'),
      ).toBeTruthy();
    });
  });

  describe('password & password_confirm field', () => {
    it('should fail if password contains less than 8 characters', () => {
      const userDataWithInvalidPassword = {
        ...userData,
        password: 'sda',
        password_confirm: 'sda',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidPassword,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'Password must contain at least 8 characters',
        ),
      ).toBeTruthy();
    });

    it('should fail if password exceeds 32 characters', () => {
      const userDataWithInvalidPassword = {
        ...userData,
        password: 'dhsahdsgdsagdsagdsaghdsagdsagdsadsadsadsadasfdsfsfw',
        password_confirm: 'dhsahdsgdsagdsagdsaghdsagdsagdsadsadsadsadasfdsfsfw',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidPassword,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'Password cannot exceed 32 characters',
        ),
      ).toBeTruthy();
    });

    it('should fail if password does not match pattern', () => {
      const userDataWithInvalidPassword = {
        ...userData,
        password: 'Rackware',
        password_confirm: 'Rackware',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidPassword,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message ===
            'Password must contain at least one capital letter, a special character and a numeric digit',
        ),
      ).toBeTruthy();
    });

    it('should fail if password and confirm password do not match', () => {
      const userDataWithInvalidPassword = {
        ...userData,
        password: 'Rackware@123',
        password_confirm: 'R@ckware123',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidPassword,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Passwords do not match',
        ),
      ).toBeTruthy();
    });
  });

  describe('phone_number field', () => {
    it('should fail if country code is not appended to phone number', () => {
      const userDataWithInvalidPhoneNumber = {
        ...userData,
        phone_number: '9765012981',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidPhoneNumber,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid Phone Number',
        ),
      ).toBeTruthy();
    });

    it('should fail if phone number format is invalid', () => {
      const userDataWithInvalidPhoneNumber = {
        ...userData,
        phone_number: '+919876543210012345',
      };
      const result: any = registerUserSchema.safeParse(
        userDataWithInvalidPhoneNumber,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid Phone Number',
        ),
      ).toBeTruthy();
    });
  });
});

describe('validate login user schema', () => {
  const email = 'shubham.sudame@gmail.com';
  const password = 'Rackware@123';
  const phone_number = '+919765012981';

  describe('login by email and password', () => {
    it('should fail when email is not provided', () => {
      const loginData = { password };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some((issue: any) => issue.code === 'invalid_type'),
      ).toBeTruthy();
    });

    it('should fail when password is not provided', () => {
      const loginData = { email };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some((issue: any) => issue.code === 'invalid_type'),
      ).toBeTruthy();
    });

    it('should fail when email is invalid', () => {
      const loginData = { email: 'sh.comub!@9*@gmail', password };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid email address',
        ),
      ).toBeTruthy();
    });

    it('should fail if password contains less than 8 characters', () => {
      const loginData = { email, password: 'sda' };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'Password must contain at least 8 characters',
        ),
      ).toBeTruthy();
    });

    it('should fail if password exceeds 32 characters', () => {
      const loginData = {
        email,
        password: 'dhsahdsgdsagdsagdsaghdsagdsagdsadsadsadsadasfdsfsfw',
      };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message === 'Password cannot exceed 32 characters',
        ),
      ).toBeTruthy();
    });

    it('should fail if password does not match pattern', () => {
      const loginData = { email, password: 'Rackware' };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.message ===
            'Password must contain at least one capital letter, a special character and a numeric digit',
        ),
      ).toBeTruthy();
    });

    it('should succeed if valid email and password are provided', () => {
      const loginData = { email, password };
      const result: any = emailPasswordSchema.safeParse(loginData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  it('should succeed even when all email & password & phone number fields are provided, ignoring the latter phone number field', () => {
    const loginData = { email, password, phone_number };
    const result: any = emailPasswordSchema.safeParse(loginData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  describe('login by phone number', () => {
    it('should fail if country code is not appended to phone number', () => {
      const loginData = { phone_number: '9765012981' };
      const result: any = phoneNumberSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid Phone Number',
        ),
      ).toBeTruthy();
    });

    it('should fail if phone number format is invalid', () => {
      const loginData = { phone_number: '+919876543210012345' };
      const result: any = phoneNumberSchema.safeParse(loginData);
      expect(result.success).toBe(false);
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Invalid Phone Number',
        ),
      ).toBeTruthy();
    });

    it('should succeed if valid phone number is provided', () => {
      const loginData = { phone_number };
      const result: any = phoneNumberSchema.safeParse(loginData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});

describe('update user details', () => {
  it(`should update user's phone number`, () => {
    const updatePhoneNumberData = { phone_number: '+919881409684' };
    const result: any = phoneNumberSchema.safeParse(updatePhoneNumberData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it(`should update user's photo`, () => {
    const updatePhotoData = {
      photo: 'src/resources/batgirl_1691935830705.jpg',
    };
    const result: any = updatePhotoSchema.safeParse(updatePhotoData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  describe(`reset user's password`, () => {
    it('should fail when password and password_confirm do not match', () => {
      const resetPasswordData = {
        password: 'Rackware@123',
        password_confirm: 'R@ckware123',
      };
      const result: any = resetPasswordSchema.safeParse(resetPasswordData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(
        result.error.issues.some(
          (issue: any) => issue.message === 'Passwords do not match',
        ),
      ).toBeTruthy();
    });

    it('should succeed when password and password_confirm match', () => {
      const resetPasswordData = {
        password: 'R@ckware123',
        password_confirm: 'R@ckware123',
      };
      const result: any = resetPasswordSchema.safeParse(resetPasswordData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
