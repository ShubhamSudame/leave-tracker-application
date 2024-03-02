import moment from 'moment';
import { CookieOptions } from 'express';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

export const DATE_FORMAT = 'DD/MM/YYYY';

// A custom function to check if a date is at least 18 years before the current date
export const isAdult = (dateString: string) => {
  // Get the current date
  const date = new Date(moment(dateString, DATE_FORMAT).toDate());
  const today = new Date();
  // Get the year, month and day of the current date
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  // Create a new date object with the same month and day as the input date, but 18 years earlier
  const birthday = new Date(year - 18, month, day);
  // Compare the input date and the birthday date
  return date <= birthday;
};

export const isValidPhoneNumber = (value: string): boolean => {
  try {
    const phoneNumber = parsePhoneNumberWithError(value);
    return !!phoneNumber && phoneNumber.isValid();
  } catch (error) {
    return false;
  }
};

export const isValidDateFormat = (date: string) => {
  const dateParts = date.split('/');
  if (dateParts.length !== 3) {
    return false;
  }
  const [day, month, year] = dateParts;
  const parsedDate = new Date(`${year}-${month}-${day}`);

  return (
    !isNaN(parsedDate.getTime()) &&
    parsedDate.getDate() === parseInt(day, 10) &&
    parsedDate.getMonth() + 1 === parseInt(month, 10) &&
    parsedDate.getFullYear() === parseInt(year, 10)
  );
};

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: true,
};

export const tokenCookieOptions = (expiry: number): CookieOptions => {
  return {
    ...cookieOptions,
    expires: new Date(Date.now() + expiry * 60 * 1000),
    maxAge: expiry * 60 * 1000,
  };
};

export enum RoleType {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum Sex {
  MALE = 'M',
  FEMALE = 'F',
}
