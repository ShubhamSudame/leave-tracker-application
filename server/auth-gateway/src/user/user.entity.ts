import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import bcrypt from 'bcrypt';
import IUser from './user.interface';
import Base from '../shared/entities/base.entity';
import { RoleType, Sex } from '../utils/common-utils';
import { UUID } from 'crypto';

@Entity('users')
export class User extends Base implements IUser {
  @Column()
  name: string;

  @Column()
  date_of_birth: string;

  @Index('email_index')
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    unique: true,
  })
  phone_number: string;

  @Column()
  organization: string;

  @Column({
    type: 'enum',
    enum: Sex,
    default: Sex.MALE,
  })
  sex: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.USER,
  })
  role: string;

  @Column({
    nullable: true,
  })
  photo: string;

  @Column({
    default: false,
  })
  verified: boolean;

  @Column({
    default: true,
  })
  initialLogin: boolean;

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

  @ManyToOne(() => User, (user) => user.subordinates)
  @JoinColumn({ name: 'managerId' })
  manager: User;

  @Column({ nullable: true })
  managerId: UUID;

  @OneToMany(() => User, (user) => user.manager)
  subordinates: User[];
}
