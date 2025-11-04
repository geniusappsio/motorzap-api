import { BaseEntity, Result, ok, fail } from '../../shared';
import { Phone } from '../value-objects/phone.vo';
import { Role, UserRole } from '../value-objects/user-role.vo';
import { InvalidUserDataError } from '../errors/user-errors';
import { randomUUID } from 'crypto';

export interface UserProps {
  phone: Phone;
  role: Role;
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends BaseEntity<UserProps> {
  constructor(props: UserProps, id: string) {
    super(props, id);
  }

  static create(data: {
    phone: Phone;
    role: Role;
    name: string;
    email?: string;
  }): Result<User> {
    const validation = User.validateCreateData(data);
    if (validation.isFailure) {
      return validation;
    }

    const user = new User(
      {
        phone: data.phone,
        role: data.role,
        name: data.name,
        email: data.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      randomUUID()
    );

    return ok(user);
  }

  static reconstitute(data: {
    id: string;
    phone: Phone;
    role: Role;
    name: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      {
        phone: data.phone,
        role: data.role,
        name: data.name,
        email: data.email,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.id
    );
  }

  private static validateCreateData(data: {
    phone: Phone;
    role: Role;
    name: string;
    email?: string;
  }): Result<void> {
    if (!data.name || data.name.trim().length === 0) {
      return fail(new InvalidUserDataError('Name is required and cannot be empty'));
    }

    if (data.name.length > 255) {
      return fail(new InvalidUserDataError('Name cannot be longer than 255 characters'));
    }

    if (data.email && !this.isValidEmail(data.email)) {
      return fail(new InvalidUserDataError('Invalid email format'));
    }

    return ok(undefined as void);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getPhone(): Phone {
    return this.props.phone;
  }

  getRole(): Role {
    return this.props.role;
  }

  getName(): string {
    return this.props.name;
  }

  getEmail(): string | undefined {
    return this.props.email;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  changeRole(newRole: Role): void {
    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  updateName(newName: string): Result<void> {
    if (!newName || newName.trim().length === 0) {
      return fail(new InvalidUserDataError('Name cannot be empty'));
    }

    if (newName.length > 255) {
      return fail(new InvalidUserDataError('Name cannot be longer than 255 characters'));
    }

    this.props.name = newName;
    this.props.updatedAt = new Date();
    return ok(undefined as void);
  }

  validate(): Result<void> {
    return ok(undefined as void);
  }
}
