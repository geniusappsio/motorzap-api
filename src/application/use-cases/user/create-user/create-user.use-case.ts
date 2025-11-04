import type { IUserRepository } from '../../../../domain/user';
import { UserAlreadyExistsError, Phone } from '../../../../domain/user';
import type { Result } from '../../../../domain/shared';
import { UserFactory } from '../../../factories/user/user.factory';
import type { CreateUserDTO } from './create-user.dto';
import type { CreateUserResponse } from './create-user.response';

export class CreateUserUseCase {
  private readonly userFactory: UserFactory;

  constructor(private readonly userRepository: IUserRepository) {
    this.userFactory = new UserFactory();
  }

  async execute(dto: CreateUserDTO): Promise<Result<CreateUserResponse>> {
    // Create entity using factory
    const userResult = this.userFactory.create(dto);
    if (userResult.isFailure) {
      return userResult;
    }

    const user = userResult.getOrThrow();

    // Check if user already exists
    const existingUserResult = await this.userRepository.findByPhone(user.getPhone());
    if (existingUserResult.isSuccess) {
      return existingUserResult.flatMap(() => {
        // Return failure if user exists
        const error = new UserAlreadyExistsError(user.getPhone().getValue());
        return { isSuccess: false, isFailure: true, error } as any;
      });
    }

    // Save user to repository
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return saveResult;
    }

    // Return response
    const response: CreateUserResponse = {
      id: user.getId(),
      phone: user.getPhone().getValue(),
      role: user.getRole().getValue(),
      name: user.getName(),
      email: user.getEmail(),
      createdAt: user.getCreatedAt(),
    };

    return { isSuccess: true, isFailure: false, value: response } as any;
  }
}
