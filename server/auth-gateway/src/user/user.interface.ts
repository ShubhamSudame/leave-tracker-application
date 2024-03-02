export default interface IUser {
  name: string;
  date_of_birth: string;
  email: string;
  password: string;
  phone_number: string;
  role: 'admin' | 'user' | undefined | string;
  photo: string;
}
