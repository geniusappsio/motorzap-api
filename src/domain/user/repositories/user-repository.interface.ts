import { User } from '../entities/user.entity';
import { Phone } from '../value-objects/phone.vo';
import type { Result } from '../../shared';

export interface IUserRepository {
  save(user: User): Promise<Result<void>>;
  findById(id: string): Promise<Result<User>>;
  findByPhone(phone: Phone): Promise<Result<User>>;
  update(user: User): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  findAll(): Promise<Result<User[]>>;
}
