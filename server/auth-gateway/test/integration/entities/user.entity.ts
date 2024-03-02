import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import bcrypt from 'bcrypt';
import IUser from '../../../src/user/user.interface';
import Base from './base.entity';

export enum RoleType {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends Base implements IUser {
  @Column()
  name!: string;

  @Column()
  date_of_birth!: string;

  @Index('email_index')
  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @Column({
    unique: true,
  })
  phone_number!: string;

  @Column({
    default: 'user',
  })
  role!: string;

  @Column({
    nullable: true,
  })
  photo!: string;

  @Column({
    default: false,
  })
  verified!: boolean;

  toJSON() {
    return { ...this, password: undefined, verified: undefined };
  }

  // Hash password before saving to database
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Validate password
  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string,
  ) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}
